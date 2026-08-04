import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert, Share } from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { generateShareText } from '../utils/shareFormatter';

type RootStackParamList = {
  SharePreview: { date: string };
};

type SharePreviewRouteProp = RouteProp<RootStackParamList, 'SharePreview'>;

interface Props {
  route: SharePreviewRouteProp;
}

export default function ShareScreen({ route }: Props) {
  const { date } = route.params;
  const [text, setText] = useState('');

  useEffect(() => {
    if (!date) {
      Alert.alert('Error', 'Missing date');
      return;
    }
    try {
      setText(generateShareText(date));
    } catch (e) {
      Alert.alert('Error', String(e));
    }
  }, [date]);

  const handleShare = async () => {
    if (!text.trim()) {
      Alert.alert('Error', 'Nothing to share');
      return;
    }
    try {
      await Share.share({ message: text });
    } catch (e) {
      Alert.alert('Error', String(e));
    }
  };

  return (
    <View style={styles.root}>
      <ScrollView style={styles.scroll}>
        <TextInput
          style={styles.textarea}
          value={text}
          onChangeText={setText}
          multiline
          textAlignVertical="top"
        />
      </ScrollView>
      <TouchableOpacity style={styles.button} onPress={handleShare}>
        <Text style={styles.buttonText}>Share</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#fff' },
  scroll: { flex: 1, padding: 16 },
  textarea: { flex: 1, fontSize: 14, color: '#333', textAlignVertical: 'top' },
  button: { margin: 16, padding: 16, borderRadius: 10, backgroundColor: '#1565c0', alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
