import React, { useState, useEffect } from 'react';
import { View, Text, Modal, Pressable, ScrollView, ActivityIndicator, Alert, TextInput, useWindowDimensions } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import orderApi from '../../../api/orderApi';
import productApi from '../../../api/productApi';

const ICE_LEVELS = ['Không đá', 'Ít đá', 'Mặc định', 'Nhiều đá'];
const SUGAR_LEVELS = ['0%', '50%', '70%', '100%'];

const ActionButton = ({ title, icon, onPress, bgColor, gradient, textColor, borderColor, containerStyle, horizontal, shadowColor, disabled }) => (
  <Pressable onPress={onPress} disabled={disabled} style={({ pressed }) => [{
    flexDirection: horizontal ? 'row' : 'column', backgroundColor: bgColor || 'transparent', borderRadius: 16,
    justifyContent: 'center', alignItems: 'center', borderWidth: borderColor ? 1.5 : 0, borderColor: borderColor || 'transparent',
    opacity: disabled ? 0.6 : (pressed ? 0.8 : 1), transform: [{ scale: (pressed && !disabled) ? 0.96 : 1 }],
    shadowColor: disabled ? 'transparent' : (shadowColor || bgColor || (gradient && gradient[1]) || '#000'),
    shadowOffset: { width: 0, height: disabled ? 0 : 6 }, shadowOpacity: disabled ? 0 : (pressed || borderColor ? 0 : 0.3),
    shadowRadius: 10, elevation: disabled ? 0 : (pressed ? 0 : 5),
  }, containerStyle]}>
    {gradient && <LinearGradient colors={gradient} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: 16 }} start={{x:0, y:0}} end={{x:1, y:1}} />}
    {disabled && title.includes('Yêu cầu') ? <ActivityIndicator color={textColor} /> : (
      <>
        {icon && <Text style={{ fontSize: horizontal ? 24 : 32, marginRight: horizontal ? 12 : 0, marginBottom: horizontal ? 0 : 6, zIndex: 1 }}>{icon}</Text>}
        <Text style={{ color: textColor, fontSize: 16, fontWeight: '800', letterSpacing: 0.5, zIndex: 1 }} adjustsFontSizeToFit numberOfLines={1}>{title}</Text>
      </>
    )}
  </Pressable>
);

const InvoiceDetailSheet = ({ table, onClose, onRefresh, onOpenMenu }) => {
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [invoice, setInvoice] = useState(null);

  // Edit item state
  const [selectedItem, setSelectedItem] = useState(null);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [selectedIce, setSelectedIce] = useState('Mặc định');
  const [selectedSugar, setSelectedSugar] = useState('50%');
  const [selectedNote, setSelectedNote] = useState('');

  const { width } = useWindowDimensions();
  const isTablet = width >= 700;

  const [toppings, setToppings] = useState([]);
  const [selectedToppings, setSelectedToppings] = useState([]);
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' });
  const [productVariants, setProductVariants] = useState([]);
  const [selectedVariantId, setSelectedVariantId] = useState(null);
  const [deleteConfirmVisible, setDeleteConfirmVisible] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [confirmModal, setConfirmModal] = useState({ visible: false, title: '', message: '', onConfirm: null });

  const showConfirm = (title, message, onConfirm) => {
    setConfirmModal({ visible: true, title, message, onConfirm });
  };

  const showToast = (message, type = 'success') => {
    setToast({ visible: true, message, type });
    setTimeout(() => setToast({ visible: false, message: '', type: 'success' }), 2000);
  };

  useEffect(() => {
    fetchToppings();
  }, []);

  const fetchToppings = async () => {
    try {
      const res = await productApi.getToppings();
      const toppingsData = Array.isArray(res) ? res : (res.data || []);
      setToppings(toppingsData);
    } catch (err) {
      console.error('Failed to fetch toppings:', err);
    }
  };

  useEffect(() => {
    if (table) fetchInvoice();
    else setInvoice(null);
  }, [table]);

  const fetchInvoice = async () => {
    const idHoaDon = table?.invoice?.idHoaDon;
    const idPhieuDat = table?.reservation?.idPhieuDat || table?.idPhieuDatTemp;

    if (!idHoaDon && !idPhieuDat) {
      setInvoice(null);
      return;
    }

    setLoading(true);
    try {
      let targetIdHoaDon = idHoaDon;

      // Nếu chưa có idHoaDon nhưng có idPhieuDat, tìm hóá đơn đang active cho phiếu đặt bàn này
      if (!targetIdHoaDon) {
        const allRes = await orderApi.getAll();
        const allInvoices = Array.isArray(allRes) ? allRes : (allRes.data || []);
        const active = allInvoices.find(inv =>
          inv.idPhieuDat === idPhieuDat &&
          inv.trangThai !== 'DA_THANH_TOAN' &&
          inv.trangThai !== 'DA_HUY'
        );
        if (active) {
            targetIdHoaDon = active.idHoaDon;
        }
      }

      if (!targetIdHoaDon) {
        setInvoice(null);
        return;
      }

      const detailRes = await orderApi.getById(targetIdHoaDon);
      setInvoice(detailRes.data || detailRes);
    } catch (err) {
      console.error('Fetch invoice error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenEdit = async (item) => {
    setSelectedItem(item);
    setSelectedVariantId(item.idBienThe);
    try {
      const opts = JSON.parse(item.tuyChonJson || '{}');
      
      const mappedIce = opts.da === 'it' ? 'Ít đá' : 
                        (opts.da === 'khong' ? 'Không đá' : 
                        (opts.da === 'nhieu' ? 'Nhiều đá' : 
                        (opts.da || 'Mặc định')));
                        
      setSelectedIce(mappedIce);
      setSelectedSugar(opts.duong || '50%');
      setSelectedNote(opts.luuY || '');
      
      const currentToppingsIds = item.danhSachTopping?.map(dt => {
        const t = toppings.find(top => top.tenSanPham === dt.tenTopping);
        return t?.idSanPham;
      }).filter(Boolean) || [];
      setSelectedToppings(currentToppingsIds);

      const productsRes = await productApi.getAll();
      const products = Array.isArray(productsRes) ? productsRes : (productsRes.data || []);
      const currentProduct = products.find(p => 
        p.danhSachBienThe?.some(v => v.idBienThe === item.idBienThe)
      );

      if (currentProduct) {
        setProductVariants(currentProduct.danhSachBienThe || []);
      } else {
        setProductVariants([]);
      }
    } catch (e) {
      setSelectedIce('Mặc định'); setSelectedSugar('50%'); setSelectedNote('');
      setSelectedToppings([]);
      setProductVariants([]);
    }
    setIsEditModalVisible(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedItem || !invoice) return;
    setEditing(true);
    try {
      const newOpts = { da: selectedIce, duong: selectedSugar, luuY: selectedNote };
      const itemId = selectedItem.idChiTiet || selectedItem.idChiTietHoaDon;
      
      const danhSachIdTopping = selectedToppings.map(id => {
        const t = toppings.find(item => item.idSanPham === id);
        return t?.danhSachBienThe?.[0]?.idBienThe;
      }).filter(Boolean);

      await orderApi.editItemInInvoice(invoice.idHoaDon, itemId, {
        idBienThe: selectedVariantId,
        soLuong: selectedItem.soLuong,
        tuyChonJson: JSON.stringify(newOpts),
        danhSachIdTopping: danhSachIdTopping
      });
      await fetchInvoice();
      if (onRefresh) onRefresh();
      setIsEditModalVisible(false);
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message || 'Không thể cập nhật món ăn.';
      showToast(errMsg, 'error');
    } finally {
      setEditing(false);
    }
  };

  const updateItemQuantity = async (item, delta) => {
    const newQty = item.soLuong + delta;
    if (newQty < 1) { handleDeleteItem(item); return; }
    setLoading(true);
    try {
      const itemId = item.idChiTiet || item.idChiTietHoaDon;
      
      const danhSachIdTopping = item.danhSachTopping?.map(dt => {
        const t = toppings.find(top => top.tenSanPham === dt.tenTopping);
        return t?.danhSachBienThe?.[0]?.idBienThe;
      }).filter(Boolean) || [];

      await orderApi.editItemInInvoice(invoice.idHoaDon, itemId, {
        idBienThe: item.idBienThe,
        soLuong: newQty,
        tuyChonJson: item.tuyChonJson,
        danhSachIdTopping: danhSachIdTopping
      });
      await fetchInvoice();
      if (onRefresh) onRefresh();
    } catch (err) {
      showToast('Không thể cập nhật số lượng.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteItem = (item) => {
    setItemToDelete(item);
    setDeleteConfirmVisible(true);
  };

  const handleRequestPayment = async () => {
    if (!invoice?.idHoaDon) return;
    showConfirm('Thanh toán', 'Gửi yêu cầu thanh toán?', async () => {
      setLoading(true);
      try {
        await orderApi.requestPayment(invoice.idHoaDon);
        await fetchInvoice();
        if (onRefresh) onRefresh();
        showToast('Đã gửi yêu cầu thanh toán thành công.', 'success');
      } catch (err) { 
        const errMsg = err.response?.data?.message || err.message || 'Không thể gửi yêu cầu.';
        showToast(errMsg, 'error'); 
      }
      finally { setLoading(false); }
    });
  };

  const handleCancelInvoice = async () => {
    if (!invoice?.idHoaDon) return;
    showConfirm('Hủy hóa đơn', 'Bạn có chắc chắn muốn hủy toàn bộ hóa đơn này không? Hành động này không thể hoàn tác.', async () => {
      setLoading(true);
      try {
        await orderApi.cancelOrder(invoice.idHoaDon);
        if (onRefresh) onRefresh();
        onClose();
        showToast('Đã hủy hóa đơn thành công.', 'success');
      } catch (err) { 
        const errMsg = err.response?.data?.message || err.message || 'Không thể hủy hóa đơn.';
        showToast(errMsg, 'error'); 
      } finally { 
        setLoading(false); 
      }
    });
  };

  if (!table) return null;

  return (
    <Modal visible={!!table} transparent animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      <View style={{ flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.65)', justifyContent: 'center', alignItems: 'center' }}>
        <Pressable style={{ position: 'absolute', top: 0, left: 0, bottom: 0, right: 0 }} onPress={onClose} />
        
        {toast.visible && (
          <View style={{ position: 'absolute', top: 40, alignSelf: 'center', backgroundColor: toast.type === 'error' ? '#FEE2E2' : '#D1FAE5', paddingVertical: 10, paddingHorizontal: 24, borderRadius: 20, alignItems: 'center', zIndex: 100, borderWidth: 1, borderColor: toast.type === 'error' ? '#EF4444' : '#10B981', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 5 }}>
            <Text style={{ color: toast.type === 'error' ? '#B91C1C' : '#047857', fontWeight: '700' }}>{toast.message}</Text>
          </View>
        )}
        
        <View style={{ 
          width: isTablet ? '65%' : '92%', 
          backgroundColor: 'rgba(255, 255, 255, 0.98)', 
          borderRadius: 24, 
          borderWidth: 1, borderColor: 'rgba(255,255,255,0.8)',
          padding: isTablet ? 36 : 24, paddingBottom: isTablet ? 32 : 24,
          maxHeight: '90%',
          shadowColor: '#10B981', shadowOffset: { width: 0, height: 20 }, shadowOpacity: 0.15, shadowRadius: 40, elevation: 20 
        }}>
          {/* Gradient Glow Blobs */}
          <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, overflow: 'hidden', borderRadius: 24 }} pointerEvents="none">
            <LinearGradient colors={['rgba(16, 185, 129, 0.12)', 'transparent']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ position: 'absolute', top: -100, left: -100, width: 350, height: 350, borderRadius: 175 }} />
            <LinearGradient colors={['rgba(245, 158, 11, 0.1)', 'transparent']} start={{ x: 1, y: 1 }} end={{ x: 0, y: 0 }} style={{ position: 'absolute', bottom: -100, right: -100, width: 400, height: 400, borderRadius: 200 }} />
          </View>



          <Pressable style={{ position: 'absolute', top: 16, right: 16, width: 44, height: 44, borderRadius: 22, backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center', zIndex: 10 }} onPress={onClose}>
            <Text style={{ fontSize: 18, color: '#64748B', fontWeight: 'bold' }}>✕</Text>
          </Pressable>

          <View style={{ marginBottom: 20 }}>
            <Text style={{ fontSize: isTablet ? 34 : 28, fontWeight: '900', color: '#1E293B', marginBottom: 4 }}>Hóa Đơn {table.tenBan}</Text>
            <Text style={{ fontSize: isTablet ? 18 : 16, fontWeight: '700', color: invoice?.trangThai === 'CHO_THANH_TOAN' ? '#D97706' : '#059669' }}>
               {invoice?.trangThai === 'CHO_THANH_TOAN' ? '🔔 Chờ thu ngân' : 
                invoice?.trangThai === 'DA_THANH_TOAN' ? '✅ Đã thanh toán' : 
                invoice?.trangThai === 'CHO_XAC_NHAN' ? '⏳ Chờ xác nhận' : '☕ Đang phục vụ'}
            </Text>
          </View>

          {loading && !invoice ? <ActivityIndicator size="large" color="#10B981" style={{ marginTop: 40 }} /> : invoice ? (
            <ScrollView showsVerticalScrollIndicator={false} style={{ flexShrink: 1 }}>
              <View style={{ backgroundColor: '#F8FAFC', borderRadius: 16, padding: 16, marginBottom: 24, borderWidth: 1, borderColor: '#E2E8F0' }}>
                {invoice.danhSachChiTiet?.slice().sort((a, b) => (a.idChiTiet || 0) - (b.idChiTiet || 0)).map((item, index) => (
                  <View key={item.idChiTiet || index} style={{ marginBottom: index === invoice.danhSachChiTiet.length - 1 ? 0 : 16, borderBottomWidth: index === invoice.danhSachChiTiet.length-1?0:1, borderBottomColor: '#F1F5F9', paddingBottom: index === invoice.danhSachChiTiet.length - 1 ? 0 : 16 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <View style={{ flex: 1, paddingRight: 12 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' }}>
                          <Text style={{ color: '#1E293B', fontSize: 17, fontWeight: '700', marginRight: 8 }}>{item.tenSanPham}</Text>
                          <Pressable onPress={() => handleOpenEdit(item)} style={{ padding: 4, backgroundColor: '#E2E8F0', borderRadius: 6 }}><Text style={{fontSize: 12}}>✏️ Sửa</Text></Pressable>
                        </View>
                        
                        <Text style={{ color: '#64748B', fontSize: 13, marginTop: 4 }}>
                          {item.tenKichCo || item.variant?.tenKichCo || 'Size M'}
                          {item.tuyChonJson ? `, ${JSON.parse(item.tuyChonJson).da || 'Mặc định'} đá - ${JSON.parse(item.tuyChonJson).duong || '50%'} đường` : ''}
                          {item.danhSachTopping?.length > 0 && `\n+ ${item.danhSachTopping.map(t => t.tenSanPham || t.tenTopping).join(', ')}`}
                          {item.tuyChonJson && JSON.parse(item.tuyChonJson).luuY ? ` • ${JSON.parse(item.tuyChonJson).luuY}` : ''}
                        </Text>
                        
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 12, backgroundColor: '#FFFFFF', alignSelf: 'flex-start', borderRadius: 8, padding: 4, shadowColor: '#000', shadowOffset:{width:0, height:1}, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 }}>
                          <Pressable onPress={() => updateItemQuantity(item, -1)} style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: '#475569', fontWeight: 'bold' }}>−</Text></Pressable>
                          <Text style={{ color: '#1E293B', fontSize: 16, fontWeight: '800', width: 40, textAlign: 'center' }}>{item.soLuong}</Text>
                          <Pressable onPress={() => updateItemQuantity(item, 1)} style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: '#D1FAE5', alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: '#059669', fontWeight: 'bold' }}>+</Text></Pressable>
                          
                          <Pressable onPress={() => handleDeleteItem(item)} style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: '#FEE2E2', alignItems: 'center', justifyContent: 'center', marginLeft: 12 }}><Text style={{ color: '#DC2626', fontSize: 12 }}>🗑️</Text></Pressable>
                        </View>
                      </View>
                      <View style={{ alignItems: 'flex-end' }}>
                         <Text style={{ color: '#059669', fontSize: 16, fontWeight: '800' }}>{item.thanhTien?.toLocaleString()}đ</Text>
                         <Text style={{ color: '#94A3B8', fontSize: 13, marginTop: 4 }}>{(item.thanhTien / item.soLuong)?.toLocaleString()}đ/1</Text>
                      </View>
                    </View>
                  </View>
                ))}
              </View>

              {/* TỔNG KẾT HÓA ĐƠN */}
              <View style={{ backgroundColor: '#F8FAFC', borderRadius: 16, padding: 20, borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 24 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}><Text style={{ color: '#64748B', fontSize: 15 }}>Tạm tính</Text><Text style={{ color: '#1E293B', fontSize: 15, fontWeight: '600' }}>{invoice.tongTienHang?.toLocaleString()}đ</Text></View>
                {invoice.danhSachThuePhi && invoice.danhSachThuePhi.length > 0 ? (
                  invoice.danhSachThuePhi.map((tp, idx) => (
                    <View key={idx} style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
                      <Text style={{ color: '#64748B', fontSize: 15 }}>
                        {tp.tenThuePhi} {tp.loaiGiaTri === 'PHAN_TRAM' ? `- ${tp.giaTriTaiThoiDiemBan}%` : ''}
                      </Text>
                      <Text style={{ color: '#1E293B', fontSize: 15, fontWeight: '600' }}>
                        {tp.soTienQuyDoi?.toLocaleString()}đ
                      </Text>
                    </View>
                  ))
                ) : (
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
                    <Text style={{ color: '#64748B', fontSize: 15 }}>Thuế & Phí</Text>
                    <Text style={{ color: '#1E293B', fontSize: 15, fontWeight: '600' }}>{invoice.tongTienThue?.toLocaleString() || 0}đ</Text>
                  </View>
                )}
                
                <View style={{ height: 1, backgroundColor: '#E2E8F0', marginBottom: 16, width: '100%' }} />

                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={{ color: '#1E293B', fontWeight: '900', fontSize: 18 }}>TỔNG THANH TOÁN</Text>
                    <Text style={{ color: '#D97706', fontSize: 24, fontWeight: '900' }}>{invoice.tongThanhToan?.toLocaleString()}đ</Text>
                </View>
              </View>

              {/* ACTION FOOTER */}
              {invoice.trangThai !== 'DA_THANH_TOAN' && (
                <View style={{ flexDirection: 'row', gap: 10 }}>
                   <ActionButton 
                      title="Gọi món" icon="➕" bgColor="#F1F5F9" textColor="#475569" borderColor="#E2E8F0"
                      horizontal containerStyle={{ flex: 1, height: 54 }} 
                      onPress={() => { onOpenMenu([table], table?.reservation?.idPhieuDat || table?.idPhieuDatTemp, false, invoice?.idHoaDon); onClose(); }} 
                   />
                   
                   {invoice.trangThai !== 'CHO_THANH_TOAN' && (
                      <ActionButton 
                         title="Yêu cầu thanh toán" icon="💳" gradient={['#FCD34D', '#F59E0B']} textColor="#78350F" shadowColor="#D97706"
                         horizontal containerStyle={{ flex: 1.8, height: 54 }} 
                         onPress={handleRequestPayment} disabled={loading}
                      />
                   )}

                   <ActionButton 
                      title="Hủy đơn" icon="🗑️" bgColor="#FFF1F2" borderColor="#FDA4AF" textColor="#E11D48"
                      horizontal containerStyle={{ flex: 1, height: 54 }} 
                      onPress={handleCancelInvoice} disabled={loading}
                   />
                </View>
              )}
            </ScrollView>
          ) : (
            <View style={{ paddingVertical: 40, alignItems: 'center' }}>
              <Text style={{ color: '#94A3B8', fontSize: 18, marginBottom: 24, fontWeight: '600' }}>Chưa có món nào được gọi.</Text>
              <ActionButton 
                 title="Bắt đầu gọi món" icon="➕" gradient={['#34D399', '#059669']} textColor="#FFFFFF" shadowColor="#047857"
                 horizontal containerStyle={{ width: '80%', height: 65 }} 
                 onPress={() => { onOpenMenu([table], table?.reservation?.idPhieuDat || table?.idPhieuDatTemp, false, invoice?.idHoaDon); onClose(); }} 
              />
            </View>
          )}

          {/* Edit Customization Modal */}
          <Modal visible={isEditModalVisible} transparent animationType="fade">
            <View style={{ flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.75)', justifyContent: 'center', alignItems: 'center' }}>
              
              {toast.visible && (
                <View style={{ position: 'absolute', top: 40, alignSelf: 'center', backgroundColor: toast.type === 'error' ? '#FEE2E2' : '#D1FAE5', paddingVertical: 10, paddingHorizontal: 24, borderRadius: 20, alignItems: 'center', zIndex: 100, borderWidth: 1, borderColor: toast.type === 'error' ? '#EF4444' : '#10B981', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 5 }}>
                  <Text style={{ color: toast.type === 'error' ? '#B91C1C' : '#047857', fontWeight: '700' }}>{toast.message}</Text>
                </View>
              )}
              <View style={{ width: isTablet ? '45%' : '90%', backgroundColor: '#FFFFFF', padding: 24, borderRadius: 24, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 20, elevation: 10 }}>
                <Text style={{ color: '#1E293B', fontSize: 20, fontWeight: '800', marginBottom: 24 }}>Tùy chỉnh: {selectedItem?.tenSanPham}</Text>
                
                <Text style={{ color: '#475569', fontWeight: '700', marginBottom: 12 }}>Size:</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 24 }}>
                  {productVariants.map(v => {
                    const isActive = selectedVariantId === v.idBienThe;
                    return (
                      <Pressable key={v.idBienThe} onPress={() => setSelectedVariantId(v.idBienThe)} style={{ paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, backgroundColor: isActive ? '#D1FAE5' : '#F1F5F9', borderWidth: 1, borderColor: isActive ? '#10B981' : '#E2E8F0' }}>
                        <Text style={{ color: isActive ? '#047857' : '#64748B', fontWeight: '700' }}>{v.tenKichCo}</Text>
                      </Pressable>
                    );
                  })}
                </View>

                <Text style={{ color: '#475569', fontWeight: '700', marginBottom: 12 }}>Đá:</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 24 }}>
                  {ICE_LEVELS.map(level => (
                    <Pressable key={level} onPress={() => setSelectedIce(level)} style={{ paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, backgroundColor: selectedIce===level ? '#D1FAE5' : '#F1F5F9', borderWidth: 1, borderColor: selectedIce===level ? '#10B981' : '#E2E8F0' }}>
                        <Text style={{ color: selectedIce===level ? '#047857' : '#64748B', fontWeight: '700' }}>{level}</Text>
                    </Pressable>
                  ))}
                </View>

                <Text style={{ color: '#475569', fontWeight: '700', marginBottom: 12 }}>Đường:</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 24 }}>
                  {SUGAR_LEVELS.map(level => (
                    <Pressable key={level} onPress={() => setSelectedSugar(level)} style={{ paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, backgroundColor: selectedSugar===level ? '#D1FAE5' : '#F1F5F9', borderWidth: 1, borderColor: selectedSugar===level ? '#10B981' : '#E2E8F0' }}>
                        <Text style={{ color: selectedSugar===level ? '#047857' : '#64748B', fontWeight: '700' }}>{level}</Text>
                    </Pressable>
                  ))}
                </View>

                <Text style={{ color: '#475569', fontWeight: '700', marginBottom: 12 }}>Toppings:</Text>
                <View style={{ backgroundColor: '#F8FAFC', borderRadius: 12, padding: 8, borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 24, maxHeight: 150 }}>
                  <ScrollView nestedScrollEnabled={true}>
                    {toppings.map((t, idx) => {
                      const isActive = selectedToppings.includes(t.idSanPham);
                      const toppingPrice = t.danhSachBienThe?.[0]?.giaBan || 0;
                      return (
                        <Pressable key={t.idSanPham} style={{ flexDirection: 'row', alignItems: 'center', padding: 12, borderBottomWidth: idx === toppings.length - 1 ? 0 : 1, borderBottomColor: '#F1F5F9', backgroundColor: isActive ? '#F0FDF4' : 'transparent' }} onPress={() => {
                          setSelectedToppings(prev =>
                            prev.includes(t.idSanPham) ? prev.filter(id => id !== t.idSanPham) : [...prev, t.idSanPham]
                          );
                        }}>
                          <View style={{ width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: isActive ? '#10B981' : '#CBD5E1', backgroundColor: isActive ? '#10B981' : 'transparent', marginRight: 12, alignItems: 'center', justifyContent: 'center' }}>
                            {isActive && <Text style={{ color: 'white', fontSize: 12, fontWeight: 'bold' }}>✓</Text>}
                          </View>
                          <Text style={{ flex: 1, fontSize: 15, color: '#1E293B', fontWeight: isActive ? '700' : '500' }}>{t.tenSanPham}</Text>
                          <Text style={{ fontSize: 14, fontWeight: '700', color: isActive ? '#059669' : '#94A3B8' }}>
                            +{new Intl.NumberFormat('vi-VN').format(toppingPrice)}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </ScrollView>
                </View>

                <TextInput 
                  style={{ backgroundColor: '#F8FAFC', color: '#1E293B', padding: 16, borderRadius: 12, marginBottom: 24, borderWidth: 1, borderColor: '#E2E8F0', height: 80, textAlignVertical: 'top' }} 
                  placeholder="Ghi chú (Ví dụ: Ít ngọt, không béo...)" placeholderTextColor="#94A3B8" multiline
                  value={selectedNote} onChangeText={setSelectedNote}
                />

                <View style={{ flexDirection: 'row', gap: 16 }}>
                  <ActionButton title="Hủy bỏ" bgColor="#F1F5F9" textColor="#475569" borderColor="#E2E8F0" containerStyle={{ flex: 1, height: 50 }} onPress={() => setIsEditModalVisible(false)} />
                  <ActionButton title="Lưu lại" gradient={['#34D399', '#059669']} textColor="#FFFFFF" shadowColor="#047857" containerStyle={{ flex: 1, height: 50 }} onPress={handleSaveEdit} disabled={editing} />
                </View>
              </View>
            </View>
          </Modal>

          {/* Custom Delete Confirmation Modal */}
          <Modal visible={deleteConfirmVisible} transparent animationType="fade">
            <View style={{ flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.75)', justifyContent: 'center', alignItems: 'center' }}>
              <View style={{ width: isTablet ? '35%' : '80%', backgroundColor: '#FFFFFF', padding: 24, borderRadius: 24, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 20, elevation: 10 }}>
                <View style={{ width: 60, height: 60, borderRadius: 30, backgroundColor: '#FEE2E2', justifyContent: 'center', alignItems: 'center', marginBottom: 16 }}>
                  <Text style={{ fontSize: 30 }}>🗑️</Text>
                </View>
                <Text style={{ color: '#1E293B', fontSize: 20, fontWeight: '800', marginBottom: 8 }}>Xóa món ăn</Text>
                <Text style={{ color: '#64748B', fontSize: 16, textAlign: 'center', marginBottom: 24 }}>Bạn có chắc chắn muốn xóa <Text style={{ fontWeight: 'bold', color: '#1E293B' }}>{itemToDelete?.tenSanPham}</Text> khỏi hóa đơn không?</Text>
                
                <View style={{ flexDirection: 'row', gap: 16, width: '100%' }}>
                  <ActionButton title="Hủy bỏ" bgColor="#F1F5F9" textColor="#475569" borderColor="#E2E8F0" containerStyle={{ flex: 1, height: 50 }} onPress={() => setDeleteConfirmVisible(false)} />
                  <ActionButton title="Xác nhận xóa" bgColor="#FFF1F2" textColor="#E11D48" borderColor="#FDA4AF" containerStyle={{ flex: 1.5, height: 50 }} onPress={async () => {
                    setDeleteConfirmVisible(false);
                    setLoading(true);
                    try {
                      const itemId = itemToDelete.idChiTiet || itemToDelete.idChiTietHoaDon;
                      await orderApi.deleteItemFromInvoice(invoice.idHoaDon, itemId);
                      await fetchInvoice();
                      if (onRefresh) onRefresh();
                      showToast('Đã xóa món ăn.', 'success');
                    } catch (err) { 
                      showToast('Không thể xóa món ăn.', 'error'); 
                    } finally { 
                      setLoading(false); 
                    }
                  }} />
                </View>
              </View>
            </View>
          </Modal>

          {/* Generic Confirmation Modal */}
          <Modal visible={confirmModal.visible} transparent animationType="fade">
            <View style={{ flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.75)', justifyContent: 'center', alignItems: 'center' }}>
              <View style={{ width: isTablet ? '35%' : '80%', backgroundColor: '#FFFFFF', padding: 24, borderRadius: 24, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 20, elevation: 10 }}>
                <Text style={{ color: '#1E293B', fontSize: 20, fontWeight: '800', marginBottom: 8 }}>{confirmModal.title}</Text>
                <Text style={{ color: '#64748B', fontSize: 16, textAlign: 'center', marginBottom: 24 }}>{confirmModal.message}</Text>
                
                <View style={{ flexDirection: 'row', gap: 16, width: '100%' }}>
                  <ActionButton title="Hủy bỏ" bgColor="#F1F5F9" textColor="#475569" borderColor="#E2E8F0" containerStyle={{ flex: 1, height: 50 }} onPress={() => setConfirmModal({ visible: false, title: '', message: '', onConfirm: null })} />
                  <ActionButton title="Xác nhận" gradient={['#34D399', '#059669']} textColor="#FFFFFF" shadowColor="#047857" containerStyle={{ flex: 1.5, height: 50 }} onPress={async () => {
                    const onConfirm = confirmModal.onConfirm;
                    setConfirmModal({ visible: false, title: '', message: '', onConfirm: null });
                    if (onConfirm) await onConfirm();
                  }} />
                </View>
              </View>
            </View>
          </Modal>

        </View>
      </View>
    </Modal>
  );
};

export default InvoiceDetailSheet;
