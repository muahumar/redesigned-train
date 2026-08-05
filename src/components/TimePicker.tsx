import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView, StyleSheet } from 'react-native';

const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
const MINUTES = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));

// P13 fix: Modal is now a sibling of TouchableOpacity, NOT nested inside it.
// Nesting Modal inside TouchableOpacity causes touch bubbling bugs on web and
// some Android versions (picker reopens or flickers immediately on open).
export default function TimePicker({ value, onChange }: { value?: string; onChange: (time: string) => void }) {
  const [visible, setVisible] = useState(false);
  const [selectedHour, setSelectedHour] = useState(0);
  const [selectedMinute, setSelectedMinute] = useState(0);

  const open = () => {
    if (value) {
      const [h, m] = value.split(':').map(Number);
      setSelectedHour(h || 0);
      setSelectedMinute(m || 0);
    }
    setVisible(true);
  };

  const confirm = () => {
    const time = `${String(selectedHour).padStart(2, '0')}:${String(selectedMinute).padStart(2, '0')}`;
    onChange(time);
    setVisible(false);
  };

  return (
    <View>
      {/* P13 fix: button and modal are siblings, not parent/child */}
      <TouchableOpacity onPress={open} style={styles.button}>
        <Text style={styles.text}>{value || '--:--'}</Text>
      </TouchableOpacity>

      <Modal visible={visible} transparent animationType="slide">
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <Text style={styles.title}>Select Time</Text>
            <View style={styles.row}>
              <ScrollView style={styles.column} showsVerticalScrollIndicator={false}>
                {HOURS.map((h) => (
                  <TouchableOpacity
                    key={h}
                    onPress={() => setSelectedHour(Number(h))}
                    style={[styles.item, selectedHour === Number(h) && styles.selectedItem]}
                  >
                    <Text style={[styles.itemText, selectedHour === Number(h) && styles.selectedText]}>{h}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <Text style={styles.separator}>:</Text>
              <ScrollView style={styles.column} showsVerticalScrollIndicator={false}>
                {MINUTES.map((m) => (
                  <TouchableOpacity
                    key={m}
                    onPress={() => setSelectedMinute(Number(m))}
                    style={[styles.item, selectedMinute === Number(m) && styles.selectedItem]}
                  >
                    <Text style={[styles.itemText, selectedMinute === Number(m) && styles.selectedText]}>{m}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
            <TouchableOpacity onPress={confirm} style={styles.confirmButton}>
              <Text style={styles.confirmText}>OK</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setVisible(false)} style={styles.cancelButton}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  button: { padding: 8, borderRadius: 6, backgroundColor: '#f0f0f0', alignSelf: 'flex-start' },
  text: { fontSize: 16, fontWeight: '600', color: '#333' },
  overlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  modal: { width: '80%', backgroundColor: '#fff', borderRadius: 12, padding: 20, alignItems: 'center' },
  title: { fontSize: 18, fontWeight: '700', marginBottom: 12 },
  row: { flexDirection: 'row', height: 200, width: '100%' },
  column: { flex: 1 },
  item: { paddingVertical: 8, alignItems: 'center' },
  selectedItem: { backgroundColor: '#e3f2fd', borderRadius: 6 },
  itemText: { fontSize: 16, color: '#333' },
  selectedText: { fontWeight: '700', color: '#1565c0' },
  separator: { fontSize: 24, fontWeight: '700', color: '#333', paddingHorizontal: 8, paddingTop: 8 },
  confirmButton: { marginTop: 16, backgroundColor: '#1565c0', paddingVertical: 10, paddingHorizontal: 32, borderRadius: 8 },
  confirmText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  cancelButton: { marginTop: 8, paddingVertical: 10 },
  cancelText: { color: '#666', fontSize: 14 },
});
