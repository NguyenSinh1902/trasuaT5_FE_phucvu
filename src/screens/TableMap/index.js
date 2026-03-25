import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, StatusBar } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import styles from './TableMap.styles';

// Sheet components
import EmptyTableSheet from './components/EmptyTableSheet';
import OccupiedTableSheet from './components/OccupiedTableSheet';
import ReserveTableSheet from './components/ReserveTableSheet';
import ReservedTableSheet from './components/ReservedTableSheet';
import EditReserveSheet from './components/EditReserveSheet';
import UpdateGuestSheet from './components/UpdateGuestSheet';

// ===================== MOCK DATA =====================
const mockTables = [
  { id: 1, name: 'Bàn 01', status: 'empty', capacity: 4 },
  { id: 2, name: 'Bàn 02', status: 'occupied', time: '45 phút', price: '285.000₫' },
  { id: 3, name: 'Bàn 03', status: 'reserved', time: '19:30' },
  { id: 4, name: 'Bàn 04', status: 'empty', capacity: 4 },
  { id: 5, name: 'Bàn 05', status: 'occupied', time: '120 phút', price: '420.000₫' },
  { id: 6, name: 'Bàn 06', status: 'empty', capacity: 8 },
  { id: 7, name: 'Bàn 07', status: 'reserved', time: '20:00' },
  { id: 8, name: 'Bàn 08', status: 'empty', capacity: 2 },
  { id: 9, name: 'Bàn 09', status: 'occupied', time: '30 phút', price: '150.000₫' },
  { id: 10, name: 'Bàn 10', status: 'empty', capacity: 6 },
  { id: 11, name: 'Bàn 11', status: 'reserved', time: '21:00' },
  { id: 12, name: 'Bàn 12', status: 'occupied', time: '90 phút', price: '560.000₫' },
];

const getStatusStyle = (status) => {
  switch (status) {
    case 'occupied': return { bg: 'rgba(139,163,103,0.18)', border: 'rgba(139,163,103,0.4)', color: '#8BA367', label: 'Có khách' };
    case 'reserved': return { bg: 'rgba(255,215,0,0.18)', border: 'rgba(255,215,0,0.4)', color: '#FFD700', label: 'Đã đặt' };
    default: return { bg: 'rgba(255,255,255,0.05)', border: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.5)', label: 'Trống' };
  }
};

// ===================== MAIN SCREEN =====================
const TableMap = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState('dine');

  // Bottom sheet state
  const [selectedTable, setSelectedTable] = useState(null);   // empty table
  const [reserveTable, setReserveTable] = useState(null);     // reserve form
  const [occupiedTable, setOccupiedTable] = useState(null);   // occupied table
  const [reservedTable, setReservedTable] = useState(null);   // reserved table info
  const [editReserveTable, setEditReserveTable] = useState(null); // edit reservation
  const [updateGuestTable, setUpdateGuestTable] = useState(null); // update guest count

  const handleTablePress = (table) => {
    if (table.status === 'empty') setSelectedTable(table);
    if (table.status === 'occupied') setOccupiedTable(table);
    if (table.status === 'reserved') setReservedTable(table);
  };

  const handleReserve = () => {
    setReserveTable(selectedTable);
    setSelectedTable(null);
  };

  const handleOpenMenu = () => {
    const table = selectedTable;
    setSelectedTable(null);
    onNavigate && onNavigate('OrderMenu', { table });
  };

  const handleUpdateGuest = () => {
    setUpdateGuestTable(occupiedTable);
    setOccupiedTable(null);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <LinearGradient colors={['#1A1A1A', '#0F1A0F']} style={styles.backgroundGradient} />

      {/* ===== HEADER ===== */}
      <View style={styles.headerContainer}>
        <LinearGradient colors={['#1E2D1E', '#172517']} style={styles.headerGradient} />
        <View style={styles.userInfoRow}>
          <View style={styles.userProfileGroup}>
            <View style={styles.avatarWrap}>
              <Text style={styles.avatarInitials}>M</Text>
            </View>
            <View>
              <Text style={styles.roleText}>Nhân viên</Text>
              <Text style={styles.nameText}>Mai Linh</Text>
              <Text style={styles.shiftText}>Ca Chiều</Text>
            </View>
          </View>
          <View style={{ position: 'relative' }}>
            <View style={styles.notiBtn}>
              <Text style={{ fontSize: 18 }}>🔔</Text>
            </View>
            <View style={styles.notiBadge}><Text style={styles.notiBadgeText}>3</Text></View>
          </View>
        </View>
        <View style={styles.globalToggle}>
          <Pressable
            style={[styles.toggleTab, activeTab === 'dine' && styles.toggleTabActive]}
            onPress={() => setActiveTab('dine')}>
            <Text style={activeTab === 'dine' ? styles.toggleTextActive : styles.toggleTextInactive}>Tại bàn</Text>
          </Pressable>
          <Pressable
            style={[styles.toggleTab, activeTab === 'take' && styles.toggleTabActive]}
            onPress={() => setActiveTab('take')}>
            <Text style={activeTab === 'take' ? styles.toggleTextActive : styles.toggleTextInactive}>Mang về</Text>
          </Pressable>
        </View>
      </View>

      {/* ===== TABLE GRID ===== */}
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {mockTables.map(t => {
          const s = getStatusStyle(t.status);
          return (
            <Pressable
              key={t.id}
              style={[styles.tableCard, { backgroundColor: s.bg, borderColor: s.border }]}
              onPress={() => handleTablePress(t)}>
              <View style={styles.tableHeader}>
                <Text style={styles.tableName}>{t.name}</Text>
                <View style={[styles.tableBadge, { backgroundColor: s.color + '30' }]}>
                  <Text style={[styles.tableBadgeText, { color: s.color }]}>{s.label}</Text>
                </View>
              </View>
              {t.status === 'empty' && <Text style={styles.tableSubText}>Sức chứa: {t.capacity} người</Text>}
              {t.status === 'occupied' && (
                <View>
                  <Text style={styles.tableSubText}>Đã ngồi: {t.time}</Text>
                  <Text style={[styles.tableSubText, { marginTop: 4 }]}>Tạm tính</Text>
                  <Text style={[styles.tableMainValue, { color: s.color }]}>{t.price}</Text>
                </View>
              )}
              {t.status === 'reserved' && (
                <View style={{ alignItems: 'center', flex: 1, justifyContent: 'center' }}>
                  <Text style={styles.tableSubText}>Giờ hẹn đến</Text>
                  <Text style={[styles.tableMainValue, { color: s.color, fontSize: 26, marginTop: 4 }]}>{t.time}</Text>
                </View>
              )}
            </Pressable>
          );
        })}
      </ScrollView>

      {/* ===== FADING EDGE ===== */}
      <LinearGradient
        colors={['rgba(18,22,20,0)', 'rgba(18,22,20,0.95)']}
        style={styles.fadeEdge}
        pointerEvents="none"
      />

      {/* ===== SUMMARY OVERLAY ===== */}
      <View style={styles.summaryOverlay}>
        <View style={styles.summaryCol}>
          <View style={[styles.summaryIconWrap, { backgroundColor: 'rgba(139,163,103,0.2)' }]}>
            <Text style={styles.summaryIcon}>👥</Text>
          </View>
          <Text style={styles.summaryValue}>2</Text>
          <Text style={styles.summaryLabel}>Đang phục vụ</Text>
        </View>
        <View style={[styles.summaryCol, styles.summaryColBorder]}>
          <View style={[styles.summaryIconWrap, { backgroundColor: 'rgba(255,215,0,0.2)' }]}>
            <Text style={styles.summaryIcon}>🕒</Text>
          </View>
          <Text style={styles.summaryValue}>2</Text>
          <Text style={styles.summaryLabel}>Đã đặt</Text>
        </View>
        <View style={styles.summaryCol}>
          <View style={[styles.summaryIconWrap, { backgroundColor: 'rgba(255,255,255,0.08)' }]}>
            <Text style={styles.summaryIcon}>💰</Text>
          </View>
          <Text style={styles.summaryValue}>705k</Text>
          <Text style={styles.summaryLabel}>Tạm tính</Text>
        </View>
      </View>

      {/* ===== BOTTOM NAV ===== */}
      <View style={styles.navOverlay}>
        <Pressable style={styles.navItem}>
          <Text style={styles.navIconActive}>🏠</Text>
          <Text style={styles.navLabelActive}>Home</Text>
        </Pressable>
        <Pressable style={styles.navItem}>
          <Text style={styles.navIcon}>📋</Text>
          <Text style={styles.navLabel}>History</Text>
        </Pressable>
        <Pressable style={styles.navItem}>
          <Text style={styles.navIcon}>⚙️</Text>
          <Text style={styles.navLabel}>Settings</Text>
        </Pressable>
        <Pressable style={styles.navItem}>
          <Text style={styles.navIcon}>👤</Text>
          <Text style={styles.navLabel}>Profile</Text>
        </Pressable>
      </View>

      {/* ===== BOTTOM SHEET MODALS ===== */}
      <EmptyTableSheet
        table={selectedTable}
        onClose={() => setSelectedTable(null)}
        onReserve={handleReserve}
        onOpenMenu={handleOpenMenu}
      />
      <ReserveTableSheet
        table={reserveTable}
        onClose={() => setReserveTable(null)}
      />
      <OccupiedTableSheet
        table={occupiedTable}
        onClose={() => setOccupiedTable(null)}
        onUpdateGuest={handleUpdateGuest}
      />
      <UpdateGuestSheet
        table={updateGuestTable}
        onClose={() => setUpdateGuestTable(null)}
      />
      <ReservedTableSheet
        table={reservedTable}
        onClose={() => setReservedTable(null)}
        onEdit={() => {
          setEditReserveTable(reservedTable);
          setReservedTable(null);
        }}
      />
      <EditReserveSheet
        table={editReserveTable}
        onClose={() => setEditReserveTable(null)}
      />
    </View>
  );
};

export default TableMap;
