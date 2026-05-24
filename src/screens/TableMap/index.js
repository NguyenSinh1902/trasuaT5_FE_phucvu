import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { View, Text, ScrollView, Pressable, StatusBar, ActivityIndicator, Dimensions, RefreshControl, useWindowDimensions, TextInput, StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import styles from './TableMap.styles';
import tableApi from '../../api/tableApi';
import orderApi from '../../api/orderApi';
import reservationApi from '../../api/reservationApi';
import staffApi from '../../api/staffApi';
import promotionApi from '../../api/promotionApi';
import safeAsyncStorage from '../../utils/storage';
import Sidebar from '../../components/Sidebar';
import Svg, { Path } from 'react-native-svg';

// Sheet components
import EmptyTableSheet from './components/EmptyTableSheet';
import UserProfileModal from './components/UserProfileModal';
import OccupiedTableSheet from './components/OccupiedTableSheet';
import ReserveTableSheet from './components/ReserveTableSheet';
import ReservedTableSheet from './components/ReservedTableSheet';
import EditReserveSheet from './components/EditReserveSheet';
import InvoiceDetailSheet from './components/InvoiceDetailSheet';
import UpdateGuestSheet from './components/UpdateGuestSheet';
import TakeawayDetailSheet from './components/TakeawayDetailSheet';
import FilterModal from './components/FilterModal';
import NotificationModal, { pushNotification } from './components/NotificationModal';
import { listenToFirebase } from '../../utils/firebaseListener';
import ReadyToServeToast from '../../components/ReadyToServeToast';

const { width: windowWidth } = Dimensions.get('window');

import { useFocusEffect } from '@react-navigation/native';

const TableMap = ({ onNavigate }) => {
  const { width } = useWindowDimensions();
  const isTablet = width >= 700;

  const [activeTab, setActiveTab] = useState('dine');
  const [tables, setTables] = useState([]);
  const [takeawayOrders, setTakeawayOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Tablet States

  const [searchQuery, setSearchQuery] = useState('');
  const [showStats, setShowStats] = useState(false);
  const [showPromo, setShowPromo] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showNotiModal, setShowNotiModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [unreadNotiCount, setUnreadNotiCount] = useState(0);

  const loadNotiCount = useCallback(async () => {
    try {
      const raw = await safeAsyncStorage.getItem('app_notifications');
      if (raw) {
        const parsed = JSON.parse(raw);
        setUnreadNotiCount(parsed.filter(n => n.isUnread).length);
      } else {
        setUnreadNotiCount(0);
      }
    } catch (e) {}
  }, []);

  // Sheets state
  const [selectedTable, setSelectedTable] = useState(null);
  const [selectedTakeaway, setSelectedTakeaway] = useState(null);
  const [reserveTable, setReserveTable] = useState(null);
  const [updateGuestTable, setUpdateGuestTable] = useState(null);
  const [invoiceTable, setInvoiceTable] = useState(null);
  const [editReserveTable, setEditReserveTable] = useState(null);

  const firebaseListenerRef = useRef(null);
  const ordersListenerRef = useRef(null);
  const isInitialLoad = useRef(true);
  const notifiedOrdersRef = useRef(new Set()); // track orders đã thông báo
  const tablesRef = useRef([]); // ref để truy cập tables trong callback

  // Toast state
  const [activeToast, setActiveToast] = useState(null);
  const [promotions, setPromotions] = useState([]);
  const [loadingPromo, setLoadingPromo] = useState(false);

  const fetchPromotions = async () => {
    setLoadingPromo(true);
    try {
      const res = await promotionApi.getActive();
      setPromotions(res.data || res);
    } catch (err) {
      console.error('Fetch promotions error:', err);
    } finally {
      setLoadingPromo(false);
    }
  };

  // Đồng hồ thời gian thực - cập nhật mỗi giây
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatElapsedTime = (startTime) => {
    if (!startTime) return '--:--:--';
    const diff = Math.max(0, currentTime.getTime() - new Date(startTime).getTime());
    const hours = Math.floor(diff / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    const pad = (num) => num.toString().padStart(2, '0');
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  };

  const fetchData = useCallback(async (showSpinner = false) => {
    // Chỉ hiện loading spinner lần đầu hoặc khi kéo refresh thủ công
    if (showSpinner || isInitialLoad.current) setLoading(true);
    try {
      const [tableRes, allInvoices, resRes] = await Promise.all([
        tableApi.getAll(),
        orderApi.getAll().catch(() => ({ data: [] })),
        reservationApi.getActiveReservations().catch(() => [])
      ]);

      const tableData = Array.isArray(tableRes) ? tableRes : (tableRes.data || []);
      const invoices = Array.isArray(allInvoices) ? allInvoices : (allInvoices.data || []);
      const reservations = Array.isArray(resRes) ? resRes : [];

      const mappedTables = tableData.map(t => {
        const res = reservations.find(r => r.danhSachBan?.some(b => b.idBan === t.idBan));

        let activeInvoice = null;

        // Ưu tiên tìm hóa đơn qua idPhieuDat (Chính xác nhất khi đổi bàn)
        if (res) {
          const resInvoices = invoices.filter(inv =>
            inv.idPhieuDat === res.idPhieuDat &&
            inv.trangThai !== 'DA_THANH_TOAN' &&
            inv.trangThai !== 'DA_HUY' &&
            inv.trangThai !== 'HOAN_TAT'
          );
          // API trả về mới nhất ở đầu mảng (descending), nên lấy index 0
          if (resInvoices.length > 0) {
            activeInvoice = resInvoices[0];
          }
        }

        // BẢO VỆ UI: Bàn trống thì tuyệt đối không hiển thị tiền (Tránh rác/zombie data từ BE)
        // if (t.tinhTrangBan === 'TRONG') {
        //   activeInvoice = null;
        // }

        // Fallback: Nếu không có phiếu đặt, nhưng bàn KHÔNG trống (tránh bàn trống hiện tiền)
        // Tìm theo tên bàn
        if (!activeInvoice && t.tinhTrangBan !== 'TRONG') {
          const tableInvoices = invoices.filter(inv =>
            inv.loaiDonHang === 'TAI_BAN' &&
            inv.danhSachTenBan?.includes(t.tenBan) &&
            inv.trangThai !== 'DA_THANH_TOAN' &&
            inv.trangThai !== 'DA_HUY' &&
            inv.trangThai !== 'HOAN_TAT'
          );
          // Lấy index 0 vì API trả về newest first
          activeInvoice = tableInvoices.length > 0 ? tableInvoices[0] : null;
        }

        return { ...t, reservation: res, invoice: activeInvoice };
      });
      setTables(mappedTables);
      tablesRef.current = mappedTables; // giữ ref đồng bộ

      const takeaways = invoices.filter(inv =>
        inv.loaiDonHang === 'MANG_VE' &&
        inv.trangThai !== 'HOAN_TAT' &&
        inv.trangThai !== 'DA_HUY'
      );
      setTakeawayOrders(takeaways);
    } catch (err) {
      console.log('Fetch data error:', err);
    } finally {
      isInitialLoad.current = false;
      setLoading(false);
    }
  }, []);

  const loadUserData = async () => {
    try {
      const storedUser = await safeAsyncStorage.getItem('user');
      if (storedUser) {
        const userObj = JSON.parse(storedUser);
        // Lấy thông tin mới nhất từ API
        const latestProfile = await staffApi.getProfile(userObj.idNhanVien);
        setCurrentUser(latestProfile.data || latestProfile);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  // Tự động làm mới khi màn hình được focus
  useFocusEffect(
    useCallback(() => {
      isInitialLoad.current = true;
      loadUserData();
      fetchData(true);
      loadNotiCount();

      // Bắt đầu lắng nghe Firebase Realtime Database cho node tables/
      const tableListener = listenToFirebase('tables', firebaseTables => {
        if (!firebaseTables || typeof firebaseTables !== 'object') return;
        // Lọc bỏ các entry null (xảy ra khi Firebase xoá/reset bàn sau thanh toán)
        const updates = Object.values(firebaseTables).filter(u => u !== null && u !== undefined && u.idBan != null);
        if (updates.length === 0) return;

        setTables(prevTables => {
          if (prevTables.length === 0) return prevTables;
          let needsFullRefresh = false;
          const next = prevTables.map(table => {
            const fbTable = updates.find(u => u.idBan == table.idBan);
            if (fbTable && fbTable.tinhTrang !== table.tinhTrangBan) {
              // Nếu bàn vừa chuyển sang TRONG (giải phóng) -> cần fetch để xóa invoice khỏi state
              if (fbTable.tinhTrang === 'TRONG') {
                needsFullRefresh = true;
              }
              return { ...table, tinhTrangBan: fbTable.tinhTrang };
            }
            return table;
          });
          tablesRef.current = next;
          if (needsFullRefresh) {
            // Timeout nhỏ để React render xong bước này trước khi fetch
            setTimeout(() => fetchData(false), 500);
          }
          return next;
        });
      });
      firebaseListenerRef.current = tableListener;

      // Lắng nghe orders/ — thông báo khi đơn chuyển sang CHO_LAY_MON và cập nhật state
      const orderListener = listenToFirebase('orders', firebaseOrders => {
        if (!firebaseOrders || typeof firebaseOrders !== 'object') return;
        // Lọc bỏ các entry null
        const orderUpdates = Object.values(firebaseOrders).filter(o => o !== null && o !== undefined && o.idHoaDon != null);

        // Thứ tự vòng đời của đơn hàng — trạng thái có rank cao hơn có nghĩa là tiến xa hơn
        const STATUS_RANK = {
          CHO_XAC_NHAN: 0, DANG_PHA_CHE: 1, CHO_LAY_MON: 2,
          DANG_PHUC_VU: 3, CHO_THANH_TOAN: 4, DA_THANH_TOAN: 5,
          HOAN_TAT: 6, DA_HUY: 6,
        };
        // Chỉ cập nhật nếu Firebase có trạng thái mới hơn hoặc bằng local
        const shouldUpdate = (localStatus, fbStatus) => {
          const localRank = STATUS_RANK[localStatus] ?? -1;
          const fbRank = STATUS_RANK[fbStatus] ?? -1;
          return fbRank >= localRank;
        };

        orderUpdates.forEach(order => {
          const key = `${order.idHoaDon}_${order.trangThai}`;

          // Toast: món đã sẵn sàng (CHO_LAY_MON)
          // An toàn vì trạng thái này chỉ tồn tại ngắn, ít bị stale
          if (order.trangThai === 'CHO_LAY_MON' && !notifiedOrdersRef.current.has(key)) {
            notifiedOrdersRef.current.add(key);

            const matchedTable = tablesRef.current.find(
              t => t.invoice?.idHoaDon == order.idHoaDon
            );
            const tableName = matchedTable?.tenBan || `Đơn #${order.idHoaDon}`;

            setActiveToast({
              id: key,
              type: 'ready',
              message: `${tableName} — Đồ uống đã pha xong, ra quầy lấy món nhé!`,
              duration: 6000,
            });
            pushNotification({ title: 'Món đã sẵn sàng', message: `${tableName} — Đồ uống đã pha xong!`, type: 'order' }).then(loadNotiCount);
          }
        });

        // Cập nhật trạng thái đơn hàng trên bàn
        // Toast thanh toán/hủy được detect tại đây để so sánh old vs new status chính xác
        setTables(prevTables => {
          let cancelledTableName = null;
          const next = prevTables.map(t => {
            if (t.invoice) {
              const fbOrder = orderUpdates.find(o => o.idHoaDon == t.invoice.idHoaDon);
              if (fbOrder && shouldUpdate(t.invoice.trangThai, fbOrder.trangThai) &&
                  (fbOrder.trangThai !== t.invoice.trangThai || fbOrder.tongThanhToan !== t.invoice.tongThanhToan)) {

                // Toast: đơn vừa chuyển sang DA_THANH_TOAN (thanh toán thành công)
                if (fbOrder.trangThai === 'DA_THANH_TOAN' && t.invoice.trangThai !== 'DA_THANH_TOAN') {
                  const msg = `${t.tenBan} — Đã thanh toán xong. Chuẩn bị dọn bàn nhé!`;
                  setActiveToast({ id: `${fbOrder.idHoaDon}_paid`, type: 'paid', message: msg, duration: 7000 });
                  pushNotification({ title: 'Đã thanh toán', message: msg, type: 'payment' }).then(loadNotiCount);
                }

                // Toast: đơn vừa bị hủy (DA_HUY)
                if (fbOrder.trangThai === 'DA_HUY' && t.invoice.trangThai !== 'DA_HUY') {
                  cancelledTableName = t.tenBan;
                  const msg = `${t.tenBan} — Đơn hàng #${fbOrder.idHoaDon} đã bị hủy!`;
                  setActiveToast({ id: `${fbOrder.idHoaDon}_cancelled`, type: 'cancelled', message: msg, duration: 7000 });
                  pushNotification({ title: 'Đơn bị hủy', message: msg, type: 'cancelled' }).then(loadNotiCount);
                }

                return { ...t, invoice: { ...t.invoice, trangThai: fbOrder.trangThai, tongThanhToan: fbOrder.tongThanhToan } };
              }
            }
            return t;
          });
          tablesRef.current = next;
          // Nếu có đơn bị hủy, cần refresh để giải phóng bàn
          if (cancelledTableName) {
            setTimeout(() => fetchData(false), 1000);
          }
          return next;
        });

        // Cập nhật trạng thái đơn mang về
        setTakeawayOrders(prevOrders => {
          let hasNewOrder = false;

          const nextOrders = prevOrders.map(o => {
            const fbOrder = orderUpdates.find(u => u.idHoaDon == o.idHoaDon);
            // Chỉ cập nhật nếu Firebase có trạng thái cao hơn hoặc bằng với local (không downgrade)
            if (fbOrder && shouldUpdate(o.trangThai, fbOrder.trangThai) &&
                (fbOrder.trangThai !== o.trangThai || fbOrder.tongThanhToan !== o.tongThanhToan)) {
              return { ...o, trangThai: fbOrder.trangThai, tongThanhToan: fbOrder.tongThanhToan };
            }
            return o;
          });

          // Nếu đơn mang về chưa tồn tại trong danh sách, hoặc nếu có đơn tại bàn mới -> gọi fetch
          orderUpdates.forEach(fbOrder => {
            // Bỏ qua các đơn đã hoàn tất/hủy vì chúng không hiển thị trên TableMap
            if (['DA_THANH_TOAN', 'DA_HUY', 'HOAN_TAT'].includes(fbOrder.trangThai)) return;

            const existsInTakeaway = prevOrders.some(o => o.idHoaDon == fbOrder.idHoaDon);
            const existsInTable = tablesRef.current.some(t => t.invoice?.idHoaDon == fbOrder.idHoaDon);
            
            if (!existsInTakeaway && !existsInTable) {
              // Đơn hàng chưa từng tồn tại trên bộ nhớ frontend -> cần lấy thông tin chi tiết
              hasNewOrder = true;
            }
          });

          if (hasNewOrder) {
            fetchData(false);
          }

          return nextOrders;
        });
      });
      ordersListenerRef.current = orderListener;

      return () => {
        firebaseListenerRef.current?.stop();
        firebaseListenerRef.current = null;
        ordersListenerRef.current?.stop();
        ordersListenerRef.current = null;
      };
    }, [fetchData])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData().finally(() => setRefreshing(false));
  }, [fetchData]);

  const filteredTables = useMemo(() => {
    let result = tables;
    if (statusFilter !== 'ALL') {
      result = result.filter(t => t.tinhTrangBan === statusFilter);
    }
    if (searchQuery) {
      result = result.filter(t => t.tenBan?.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    return result;
  }, [tables, searchQuery, statusFilter]);

  const filteredTakeaways = useMemo(() => {
    if (!searchQuery) return takeawayOrders;
    return takeawayOrders.filter(o =>
      o.idHoaDon?.toString().includes(searchQuery) ||
      o.tenKhachHang?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [takeawayOrders, searchQuery]);

  const getStatusStyle = (tinhTrang) => {
    switch (tinhTrang) {
      case 'TRONG': return { bg: '#DCFCE7', color: '#22C55E', baseColor: '#22C55E', label: 'Bàn Trống' };
      case 'DA_DAT': return { bg: '#DBEAFE', color: '#3B82F6', baseColor: '#3B82F6', label: 'Đã Đặt' };
      case 'CO_KHACH': return { bg: '#FEE2E2', color: '#EF4444', baseColor: '#EF4444', label: 'Đang Dùng' };
      default: return { bg: '#E5E7EB', color: '#94A3B8', baseColor: '#94A3B8', label: 'Không xác định' };
    }
  };

  const getTakeawayStatusStyle = (status) => {
    switch (status) {
      case 'CHO_XAC_NHAN': return { bg: '#F1F5F9', color: '#64748B', label: 'Chờ xác nhận' };
      case 'DANG_PHA_CHE': return { bg: '#EFF6FF', color: '#3B82F6', label: 'Đang pha chế' };
      case 'CHO_LAY_MON': return { bg: '#F0FDFA', color: '#0D9488', label: 'Chờ lấy món' };
      case 'CHO_THANH_TOAN': return { bg: '#FFF7ED', color: '#EA580C', label: 'Chờ thanh toán' };
      case 'DA_THANH_TOAN': return { bg: '#FEFCE8', color: '#CA8A04', label: 'Đã thanh toán' };
      default: return { bg: '#F1F5F9', color: '#94A3B8', label: status || 'Đang xử lý' };
    }
  };

  const getOrderStatusStyle = (status) => {
    switch (status) {
      case 'CHO_XAC_NHAN': return { bg: '#BCF0DA', color: '#10B981', label: 'Chờ xác nhận' };
      case 'DANG_PHA_CHE': return { bg: '#DBEAFE', color: '#3B82F6', label: 'Đang pha chế' };
      case 'CHO_LAY_MON': return { bg: '#CFFAFE', color: '#06B6D4', label: 'Chờ lấy món' };
      case 'DANG_PHUC_VU': return { bg: '#DCFCE7', color: '#22C55E', label: 'Đang phục vụ' };
      case 'CHO_THANH_TOAN': return { bg: '#FEF3C7', color: '#D97706', label: 'Chờ thanh toán' };
      case 'DA_THANH_TOAN': return { bg: '#FEF08A', color: '#A16207', label: 'Đã thanh toán' };
      case 'HOAN_TAT': return { bg: '#F3E8FF', color: '#9333EA', label: 'Hoàn tất' };
      case 'DA_HUY': return { bg: '#FEE2E2', color: '#EF4444', label: 'Đã hủy' };
      default: return { bg: '#E5E7EB', color: '#94A3B8', label: 'Không xác định' };
    }
  };

  const handleTablePress = (table) => setSelectedTable(table);

  const handleOpenMenu = (selectedTables, reservation, isTakeaway = false, invoiceId = null) => {
    let table = Array.isArray(selectedTables) && selectedTables.length > 0 ? selectedTables[0] : (selectedTable || null);
    if (!isTakeaway && reservation && table) {
      if (!table.reservation) table = { ...table, reservation: { idPhieuDat: reservation } };
      else if (!table.reservation.idPhieuDat) table.reservation.idPhieuDat = reservation;
    }
    onNavigate('OrderMenu', { table, reservation, isTakeaway, invoiceId });
  };

  // =========================================================
  // ========== RENDER BLOCKS ================================
  // =========================================================



  const renderTabletTopHeader = () => (
    <View style={styles.topHeader}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 32 }}>
        <View style={styles.globalToggle}>
          <Pressable style={[styles.toggleTab, activeTab === 'dine' && styles.toggleTabActive]} onPress={() => setActiveTab('dine')}>
            {activeTab === 'dine' ? (
              <LinearGradient colors={['#84CC7B', '#5B9A55']} style={{ width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' }}>
                <Text style={styles.toggleTextActive}>Tại bàn</Text>
              </LinearGradient>
            ) : (
              <Text style={styles.toggleTextInactive}>Tại bàn</Text>
            )}
          </Pressable>
          <Pressable style={[styles.toggleTab, activeTab === 'take' && styles.toggleTabActive]} onPress={() => setActiveTab('take')}>
            {activeTab === 'take' ? (
              <LinearGradient colors={['#84CC7B', '#5B9A55']} style={{ width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' }}>
                <Text style={styles.toggleTextActive}>Mang về</Text>
              </LinearGradient>
            ) : (
              <Text style={styles.toggleTextInactive}>Mang về</Text>
            )}
          </Pressable>
        </View>
        {activeTab === 'dine' && (
          <View style={styles.legendGroup}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#22C55E' }]} />
              <Text style={styles.legendText}>Trống</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#EF4444' }]} />
              <Text style={styles.legendText}>Có khách</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#3B82F6' }]} />
              <Text style={styles.legendText}>Đã đặt</Text>
            </View>
          </View>
        )}
      </View>

      <View style={styles.searchFilterGroup}>
        <View style={styles.searchBarWrap}>
          <View style={styles.searchIconOuter}>
            <Text style={styles.searchIconInner}>⚲</Text>
          </View>
          <TextInput
            style={styles.searchInput}
            placeholder={activeTab === 'dine' ? 'Tìm kiếm bàn...' : 'Tìm mã đơn / tên khách...'}
            placeholderTextColor="#94A3B8"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <Pressable style={styles.filterBtn} onPress={() => setShowFilterModal(true)}>
          <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <Path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" stroke="#64748B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        </Pressable>
        <Pressable style={styles.filterBtn} onPress={() => setShowNotiModal(true)}>
          <Text style={styles.filterBtnIcon}>🔔</Text>
          {unreadNotiCount > 0 && (
            <View style={styles.tabletNotiBadge}>
              <Text style={styles.tabletNotiBadgeText}>{unreadNotiCount > 9 ? '9+' : unreadNotiCount}</Text>
            </View>
          )}
        </Pressable>
      </View>
    </View>
  );

  // ── TABLE CARD ──────────────────────────────────────────
  const renderTableCard = (t) => {
    const s = getStatusStyle(t.tinhTrangBan);
    const hasInvoice = t.tinhTrangBan === 'CO_KHACH' && t.invoice;
    const orderStatus = hasInvoice ? getOrderStatusStyle(t.invoice.trangThai) : null;
    const showOnlyStatusTag = t.tinhTrangBan === 'DA_DAT';

    // Xác định màu gradient dựa trên trạng thái
    let gradientColors = ['#FFFFFF', '#F8FAFC']; // Mặc định: Trống (Trắng -> Xám cực kỳ nhạt, gần như trắng)
    if (t.tinhTrangBan === 'CO_KHACH') {
      gradientColors = ['#FFFFFF', '#FECACA']; // Đang dùng (Trắng -> Đỏ rõ hơn)
    } else if (t.tinhTrangBan === 'DA_DAT') {
      gradientColors = ['#FFFFFF', '#BFDBFE']; // Đã đặt (Trắng -> Xanh dương rõ và đậm hơn)
    }

    // Elapsed time
    const elapsedTime = hasInvoice
      ? formatElapsedTime(t.invoice.thoiGianTao)
      : t.tinhTrangBan === 'DA_DAT' && t.reservation?.thoiGianDat
        ? t.reservation.thoiGianDat.slice(11, 16)
        : '--:--:--';

    // Phát sáng viền phong cách Neon Glass
    const hasGlow = !!orderStatus;
    const glowColor = hasGlow ? orderStatus.color : '#64748B';
    const glowOpacity = hasGlow ? 0.4 : 0.08; // Giảm opacity để quầng sáng dịu hơn
    const glowRadius = hasGlow ? 15 : 8;
    const glowOffset = hasGlow ? { width: 0, height: 0 } : { width: 0, height: 4 };

    return (
      <Pressable
        key={t.idBan}
        style={[
          styles.tabletTableCard, 
          { 
            borderTopColor: s.baseColor,
            borderColor: hasGlow ? `${glowColor}66` : '#E5E7EB',
            borderWidth: hasGlow ? 2 : 1,
            shadowColor: glowColor,
            shadowOpacity: glowOpacity,
            shadowRadius: glowRadius,
            shadowOffset: glowOffset,
            elevation: hasGlow ? 10 : 4,
          }
        ]}
        onPress={() => handleTablePress(t)}
      >
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[StyleSheet.absoluteFill, { borderRadius: 16 }]}
        />

        {/* Bell Icon decoration for specific statuses */}
        {(t.invoice?.trangThai === 'CHO_THANH_TOAN' || t.invoice?.trangThai === 'CHO_LAY_MON') && (
          <View style={{ position: 'absolute', top: -12, right: -5, zIndex: 99, transform: [{ rotate: '15deg' }] }}>
            <Text style={{ fontSize: 24 }}>🔔</Text>
          </View>
        )}

        {/* Nội dung Card */}
        <View style={{ flex: 1, justifyContent: 'space-between' }}>
          {/* Row 1: Tên bàn + Tag trạng thái đơn */}
          <View style={styles.newCardTopRow}>
            <Text style={styles.newCardTitle} numberOfLines={1} adjustsFontSizeToFit>{t.tenBan}</Text>
            {orderStatus ? (
              <View style={[styles.newCardStatusTag, { backgroundColor: orderStatus.bg }]}>
                <View style={[styles.newCardStatusDot, { backgroundColor: orderStatus.color }]} />
                <Text style={[styles.newCardStatusText, { color: orderStatus.color }]}>{orderStatus.label}</Text>
              </View>
            ) : showOnlyStatusTag ? (
              <View style={[styles.newCardStatusTag, { backgroundColor: s.bg }]}>
                <View style={[styles.newCardStatusDot, { backgroundColor: s.baseColor }]} />
                <Text style={[styles.newCardStatusText, { color: s.baseColor }]}>{s.label}</Text>
              </View>
            ) : null}
          </View>

          {/* Row 2: Đồng hồ căn giữa */}
          <View style={styles.newCardMiddleRow}>
            <View style={styles.newCardInfoTag}>
              <Text style={styles.newCardInfoIcon}>🕒</Text>
              <Text style={styles.newCardInfoText}>{elapsedTime}</Text>
            </View>
          </View>

          {/* Row 3: Tạm tính + Giá */}
          <View style={styles.newCardBottomRow}>
            <Text style={styles.newCardBottomLabel}>Tạm tính</Text>
            <Text
              style={[styles.newCardPriceText, { color: hasInvoice && t.invoice?.tongThanhToan > 0 ? '#EF4444' : '#94A3B8' }]}
              adjustsFontSizeToFit
              numberOfLines={1}
            >
              {hasInvoice && t.invoice?.tongThanhToan ? Math.round(t.invoice.tongThanhToan).toLocaleString('vi-VN') + ' VND' : '0 VND'}
            </Text>
          </View>
        </View>
      </Pressable>
    );
  };

  // ── TAKEAWAY CARD ───────────────────────────────────────
  // ── TAKEAWAY CARD ───────────────────────────────────────
  const renderTakeawayCard = (order) => {
    // Không hiện các đơn đã hoàn tất hoặc đã hủy
    if (order.trangThai === 'HOAN_TAT' || order.trangThai === 'DA_HUY') return null;

    const s = getTakeawayStatusStyle(order.trangThai);
    const orderStatusStyle = getOrderStatusStyle(order.trangThai);
    const isWaitingPayment = order.trangThai === 'CHO_THANH_TOAN';

    // Xác định màu gradient dựa trên trạng thái đơn mang về
    let gradientColors = ['#FFFFFF', '#F8FAFC']; // Mặc định
    switch (order.trangThai) {
      case 'CHO_XAC_NHAN': gradientColors = ['#FFFFFF', '#F1F5F9']; break;
      case 'DANG_PHA_CHE': gradientColors = ['#FFFFFF', '#EFF6FF']; break;
      case 'CHO_LAY_MON': gradientColors = ['#FFFFFF', '#F0FDFA']; break;
      case 'CHO_THANH_TOAN': gradientColors = ['#FFFFFF', '#FFF7ED']; break;
      case 'DA_THANH_TOAN': gradientColors = ['#FFFFFF', '#FEFCE8']; break;
    }

    // Lấy tóm tắt món ăn
    const itemSummary = order.danhSachChiTiet?.length > 0
      ? order.danhSachChiTiet.map(item => `${item.soLuong}x ${item.tenSanPham}`).join(', ')
      : 'Không có chi tiết món';

    return (
      <Pressable
        key={order.idHoaDon}
        style={[
          styles.tabletTakeawayCard,
          { borderTopColor: s.color },
          isWaitingPayment && styles.glowingBorder
        ]}
        onPress={() => setSelectedTakeaway(order)}
      >
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />

        <View style={{ flex: 1 }}>
          {/* Header Row */}
          <View style={styles.newCardTopRow}>
            <View>
              <Text style={styles.newCardTitle}>Đơn #{order.idHoaDon}</Text>
              <Text style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>
                {formatElapsedTime(order.thoiGianTao)}
              </Text>
            </View>
            <View style={[styles.newCardStatusTag, { backgroundColor: orderStatusStyle.bg }]}>
              <View style={[styles.newCardStatusDot, { backgroundColor: orderStatusStyle.color }]} />
              <Text style={[styles.newCardStatusText, { color: orderStatusStyle.color }]}>{orderStatusStyle.label}</Text>
            </View>
          </View>

          {/* Details Row - Tóm tắt món */}
          <View style={styles.newCardDetails}>
            <Text style={styles.newCardDetailsText} numberOfLines={1}>
              📦 {itemSummary}
            </Text>
          </View>

          {/* Footer Row */}
          <View style={styles.newCardBottomRow}>
            <View>
              <Text style={{ fontSize: 12, color: '#94A3B8' }}>Khách hàng</Text>
              <Text style={styles.newCardBottomLabel} numberOfLines={1}>
                👤 {order.tenKhachHang || 'Khách vãng lai'}
              </Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={{ fontSize: 12, color: '#94A3B8' }}>Tổng cộng</Text>
              <Text
                style={[styles.newCardPriceText, { color: '#059669' }]}
                adjustsFontSizeToFit
                numberOfLines={1}
              >
                {order.tongThanhToan ? Math.round(order.tongThanhToan).toLocaleString('vi-VN') + 'đ' : '0đ'}
              </Text>
            </View>
          </View>
        </View>
      </Pressable>
    );
  };

  const renderTabletGrid = () => (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={styles.tabletGrid}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#34A853" />}
    >
      {loading && !refreshing ? (
        <ActivityIndicator size="large" color="#34A853" style={{ marginTop: 40, alignSelf: 'center', width: '100%' }} />
      ) : activeTab === 'dine' ? (
        filteredTables.map(renderTableCard)
      ) : (
        filteredTakeaways.map(renderTakeawayCard)
      )}
    </ScrollView>
  );

  // ── FABs: Vertical stack, bottom-right ─────────────────
  const renderTabletFABs = () => (
    <View style={styles.fabContainer}>
      {activeTab === 'take' && (
        <Pressable onPress={() => handleOpenMenu([], null, true)}>
          <LinearGradient colors={['#3B82F6', '#2563EB']} style={styles.premiumFab}>
            <Text style={styles.premiumFabIcon}>+</Text>
          </LinearGradient>
        </Pressable>
      )}
      {/* Khuyến mãi - nút trên */}
      <Pressable onPress={() => { 
        const nextShow = !showPromo;
        setShowPromo(nextShow); 
        setShowStats(false); 
        if (nextShow) fetchPromotions();
      }}>
        <LinearGradient colors={['#F59E0B', '#D97706']} style={styles.premiumFab}>
          <Text style={styles.premiumFabIcon}>🎁</Text>
        </LinearGradient>
      </Pressable>
      {/* Thống kê - nút dưới */}
      <Pressable onPress={() => { setShowStats(!showStats); setShowPromo(false); }}>
        <LinearGradient colors={['#0D9488', '#0F766E']} style={styles.premiumFab}>
          <Text style={styles.premiumFabIcon}>📊</Text>
        </LinearGradient>
      </Pressable>
    </View>
  );

  // ── Thống kê Modal: Bottom-center, NO backdrop ─────────
  const renderTabletStatsModal = () => {
    if (!showStats) return null;
    return (
      <View style={styles.bottomModalContainer} pointerEvents="box-none">
        <View style={styles.statsModalCard}>
          <View style={styles.statsBannerCol}>
            <View style={[styles.statsBannerIconWrap, { backgroundColor: 'rgba(239,68,68,0.15)' }]}><Text>👥</Text></View>
            <View style={styles.statsBannerTextGroup}>
              <Text style={styles.statsBannerLabel}>Đang phục vụ</Text>
              <Text style={[styles.statsBannerValue, { color: '#EF4444' }]}>{tables.filter(t => t.tinhTrangBan === 'CO_KHACH').length}</Text>
            </View>
          </View>
          <View style={styles.statsBannerDivider} />
          <View style={styles.statsBannerCol}>
            <View style={[styles.statsBannerIconWrap, { backgroundColor: 'rgba(59,130,246,0.15)' }]}><Text>🕒</Text></View>
            <View style={styles.statsBannerTextGroup}>
              <Text style={styles.statsBannerLabel}>Đã đặt</Text>
              <Text style={[styles.statsBannerValue, { color: '#3B82F6' }]}>{tables.filter(t => t.tinhTrangBan === 'DA_DAT').length}</Text>
            </View>
          </View>
          <View style={styles.statsBannerDivider} />
          <View style={styles.statsBannerCol}>
            <View style={[styles.statsBannerIconWrap, { backgroundColor: 'rgba(245,158,11,0.15)' }]}><Text>💰</Text></View>
            <View style={styles.statsBannerTextGroup}>
              <Text style={styles.statsBannerLabel}>Tạm thu</Text>
              <Text style={[styles.statsBannerValue, { color: '#F59E0B' }]}>
                {tables.reduce((acc, t) => acc + (t.invoice?.tongThanhToan || 0), 0).toLocaleString('vi-VN')} VND
              </Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  // ── Khuyến mãi Modal: Bottom-center, NO backdrop ────────
  const renderPromoModal = () => {
    if (!showPromo) return null;
    return (
      <View style={styles.bottomModalContainer} pointerEvents="box-none">
        <View style={styles.promoModalCard}>
          <View style={styles.promoModalHeader}>
            <Text style={styles.promoModalTitle}>🎁 Khuyến mãi hôm nay</Text>
            <Pressable onPress={() => setShowPromo(false)}>
              <Text style={styles.promoModalClose}>✕</Text>
            </Pressable>
          </View>
          <View style={styles.promoModalDivider} />
          
          {loadingPromo ? (
            <ActivityIndicator size="small" color="#F59E0B" style={{ marginVertical: 20 }} />
          ) : promotions.length > 0 ? (
            <ScrollView style={{ maxHeight: 200 }} nestedScrollEnabled={true}>
              {promotions.map((p, idx) => (
                <View key={p.idKhuyenMai || idx} style={{ backgroundColor: '#FFFBEB', padding: 12, borderRadius: 12, marginBottom: 10, borderWidth: 1, borderColor: '#FDE68A', borderStyle: 'dashed' }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={{ color: '#B45309', fontWeight: '800', fontSize: 16 }}>{p.maCode}</Text>
                    <Text style={{ color: '#D97706', fontWeight: '700' }}>
                      {p.loaiKhuyenMai === 'GIAM_PHAN_TRAM' ? `-${p.giaTriGiam}%` : `-${p.giaTriGiam?.toLocaleString()}đ`}
                    </Text>
                  </View>
                  <Text style={{ color: '#78350F', fontSize: 13, marginTop: 4 }}>
                    Đơn tối thiểu: {p.donToiThieu?.toLocaleString()}đ
                  </Text>
                  <Text style={{ color: '#92400E', fontSize: 11, marginTop: 2 }}>
                    HSD: {new Date(p.ngayHetHan).toLocaleDateString('vi-VN')}
                  </Text>
                </View>
              ))}
            </ScrollView>
          ) : (
            <Text style={styles.promoModalEmpty}>Hiện chưa có chương trình khuyến mãi nào đang chạy.</Text>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={isTablet ? styles.tabletContainer : styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      {isTablet ? (
        <>

          <View style={styles.tabletMain}>
            {/* --- WATERMARK DECORATIONS --- */}
            <View style={[StyleSheet.absoluteFillObject, { overflow: 'hidden', zIndex: 0 }]} pointerEvents="none">
              <Text style={{ position: 'absolute', top: 120, right: -40, fontSize: 320, opacity: 0.05, transform: [{ rotate: '15deg' }] }}>🍃</Text>
              <Text style={{ position: 'absolute', bottom: -50, left: -20, fontSize: 260, opacity: 0.05, transform: [{ rotate: '-25deg' }] }}>🧋</Text>
              <Text style={{ position: 'absolute', top: 450, left: 200, fontSize: 180, opacity: 0.05, transform: [{ rotate: '45deg' }] }}>🌿</Text>
            </View>

            {renderTabletTopHeader()}
            {renderTabletGrid()}
            {renderTabletFABs()}
            {renderTabletStatsModal()}
            {renderPromoModal()}
          </View>
        </>
      ) : (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text>Xoay màn hình để dùng POS mode</Text>
        </View>
      )}

      {selectedTable && selectedTable.tinhTrangBan === 'TRONG' && (
        <EmptyTableSheet table={selectedTable} tables={tables} onClose={() => setSelectedTable(null)} onReserve={() => { setReserveTable(selectedTable); setSelectedTable(null); }} onOpenMenu={(tables, resId) => handleOpenMenu(tables, resId)} onRefresh={fetchData} />
      )}
      {selectedTable && selectedTable.tinhTrangBan === 'CO_KHACH' && (
        <OccupiedTableSheet table={selectedTable} tables={tables} onClose={() => setSelectedTable(null)} onUpdateGuest={() => { setUpdateGuestTable(selectedTable); setSelectedTable(null); }} onRefresh={fetchData} onOpenMenu={(tables, resId, isTakeaway, invId) => handleOpenMenu(tables, resId, isTakeaway, invId)} onViewInvoice={(table) => { setInvoiceTable(table); setSelectedTable(null); }} />
      )}
      {selectedTable && selectedTable.tinhTrangBan === 'DA_DAT' && (
        <ReservedTableSheet table={selectedTable} onClose={() => setSelectedTable(null)} onRefresh={fetchData} onOpenMenu={(tables, res) => handleOpenMenu(tables, res)} onEdit={() => { setEditReserveTable(selectedTable); setSelectedTable(null); }} />
      )}
      {reserveTable && <ReserveTableSheet table={reserveTable} tables={tables} onClose={() => setReserveTable(null)} onRefresh={fetchData} />}
      {updateGuestTable && <UpdateGuestSheet table={updateGuestTable} onClose={() => setUpdateGuestTable(null)} onRefresh={fetchData} />}
      {invoiceTable && <InvoiceDetailSheet table={invoiceTable} onClose={() => setInvoiceTable(null)} onRefresh={fetchData} onOpenMenu={(tables, resId, isTakeaway, invId) => handleOpenMenu(tables, resId, isTakeaway, invId)} />}
      {editReserveTable && <EditReserveSheet table={editReserveTable} onClose={() => setEditReserveTable(null)} onRefresh={fetchData} />}
      {selectedTakeaway && <TakeawayDetailSheet invoice={selectedTakeaway} onClose={() => setSelectedTakeaway(null)} onRefresh={fetchData} onOpenMenu={(tables, res, takeaway, invId) => handleOpenMenu([], null, true, invId)} />}

      <FilterModal
        isVisible={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        currentFilter={statusFilter}
        onSelectFilter={setStatusFilter}
      />
      <NotificationModal
        isVisible={showNotiModal}
        onClose={() => {
          setShowNotiModal(false);
          loadNotiCount();
        }}
      />
      <ReadyToServeToast
        toast={activeToast}
        onDismiss={() => setActiveToast(null)}
      />
    </View>
  );
};

export default TableMap;
