// app/(tabs)/index.tsx
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  FlatList,
  StyleSheet,
  Image,
  Switch,
  Pressable,
  Animated,
  Alert,
} from 'react-native';

import { useColorScheme } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useUserViewModel } from '../../src/viewmodels/useUserViewModel';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);


export default function HomeScreen() {
  const {
    users,
    editingIndex,
    loading,
    addUser,
    updateUser,
    startEdit,
    clearEdit,
  } = useUserViewModel();
  const systemScheme = useColorScheme();
  const [isDark, setIsDark] = useState(systemScheme === 'dark');

  const theme = isDark
  ? {
    background: '#121212',
    text: '#ffffff',
    card: '#1e1e1e',
    border: '#333333',
    accent: '#90caf9',
    placeholder: '#aaaaaa',
  }
  : {
    background: '#ffffff',
    text: '#000000',
    card: '#ffffff',
    border: '#dddddd',
    accent: '#1976d2',
    placeholder: '#777777',
  };


  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);


  const addScale = useRef(new Animated.Value(1)).current;
  // коли починаємо редагування — підставляємо дані у форму
  useEffect(() => {
    if (editingIndex !== null && users[editingIndex]) {
      const u = users[editingIndex];
      setName(u.name);
      setEmail(u.email);
      setPhone(u.phone);
      setPhotoUri(u.photoUri ?? null);
    } else {
      setPhotoUri(null);
    }
  }, [editingIndex, users]);

    const onAddPressIn = () => {
    Animated.spring(addScale, {
      toValue: 0.96,
      useNativeDriver: true,
      speed: 20,
      bounciness: 8,
    }).start();
  };

  const onAddPressOut = () => {
    Animated.spring(addScale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 20,
      bounciness: 8,
    }).start();
  };


  async function pickFromGallery() {
    const { status } =
    await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert('Потрібний дозвіл до галереї');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      quality: 0.7,
    });

    if (!result.canceled && result.assets.length > 0) {
      setPhotoUri(result.assets[0].uri);
    }
  }

  async function takePhoto() {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      alert('Потрібний дозвіл до камери');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.7,
    });

    if (!result.canceled && result.assets.length > 0) {
      setPhotoUri(result.assets[0].uri);
    }
  }

  function handleSubmit() {
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedPhone = phone.trim();

    if (!trimmedName || !trimmedEmail || !trimmedPhone) {
      setError('Заповніть усі поля форми.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setError(
        'Вкажіть коректну електронну пошту у форматі name@example.com.'
      );
      return;
    }

    const digitsOnly = trimmedPhone.replace(/\s/g, '');
    const phoneRegex = /^\+?\d{10,15}$/;
    if (!phoneRegex.test(digitsOnly)) {
      setError(
        'Вкажіть коректний номер телефону: тільки цифри, можна + на початку (10–15 цифр).'
      );
      return;
    }

    // якщо все ок — очищаємо помилку
    setError(null);

    if (editingIndex === null) {
      addUser(trimmedName, trimmedEmail, digitsOnly, photoUri ?? null);
    } else {
      updateUser(
        editingIndex,
        trimmedName,
        trimmedEmail,
        digitsOnly,
        photoUri ?? null
      );
      clearEdit();
    }

    setName('');
    setEmail('');
    setPhone('');
    setPhotoUri(null);
  }



  if (loading) {
    return (
      <View style={styles.container}>
      <Text>Завантаження користувачів...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
    <Text style={[styles.title, { color: theme.text }]}>
    Користувачі (MVVM)
    </Text>

    {error && (
      <Text style={[styles.errorText, { color: '#ff5252' }]}>
      {error}
      </Text>
    )}

    <View style={styles.themeRow}>
    <Text style={{ color: theme.text }}>Світла</Text>
    <Switch
    value={isDark}
    onValueChange={setIsDark}
    thumbColor={isDark ? theme.accent : '#f5f5f5'}
    />
    <Text style={{ color: theme.text }}>Темна</Text>
    </View>

    <View style={styles.form}>
    <TextInput
    style={[
      styles.input,
      { color: theme.text, borderColor: theme.border },
    ]}
    placeholder="Ім'я"
    placeholderTextColor={theme.placeholder}
    value={name}
    onChangeText={setName}
    />

    <TextInput
    style={[
      styles.input,
      { color: theme.text, borderColor: theme.border },
    ]}
    placeholder="Електронна пошта"
    placeholderTextColor={theme.placeholder}
    value={email}
    onChangeText={setEmail}
    />

    <TextInput
    style={[
      styles.input,
      { color: theme.text, borderColor: theme.border },
    ]}
    placeholder="Телефон"
    placeholderTextColor={theme.placeholder}
    value={phone}
    onChangeText={setPhone}
    />


    {photoUri && (
      <View style={styles.photoPreviewWrapper}>
      <Image source={{ uri: photoUri }} style={styles.photoPreview} />
      </View>
    )}

    <View style={styles.photoButtonsRow}>
    <View style={styles.photoButton}>
    <Button title="З галереї" onPress={pickFromGallery} />
    </View>
    <View style={styles.photoButton}>
    <Button title="Зробити фото" onPress={takePhoto} />
    </View>
    </View>

    <AnimatedPressable
    style={[
      styles.addButton,
      { transform: [{ scale: addScale }] },
    ]}
    onPressIn={onAddPressIn}
    onPressOut={onAddPressOut}
    onPress={handleSubmit}
    >
    <Text style={styles.addButtonText}>
    {editingIndex === null ? 'ДОДАТИ КОРИСТУВАЧА' : 'ЗБЕРЕГТИ ЗМІНИ'}
    </Text>
    </AnimatedPressable>

    </View>

    <Text style={[styles.subtitle, { color: theme.text }]}>
    Список користувачів:
    </Text>


    <FlatList
    data={users}
    keyExtractor={(_, index) => index.toString()}
    renderItem={({ item, index }) => {
      return (
        <View style={styles.userItem}>
        {item.photoUri ? (
          <Image source={{ uri: item.photoUri }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
          <Text style={styles.avatarInitial}>
          {item.name?.[0]?.toUpperCase() ?? '?'}
          </Text>
          </View>
        )}

        <View style={{ flex: 1 }}>
        <Text style={[styles.userName, { color: theme.text }]}>{item.name}</Text>
        <Text style={{ color: theme.text }}>{item.email}</Text>
        <Text style={{ color: theme.text }}>{item.phone}</Text>
        </View>

        <Button title="Редагувати" onPress={() => startEdit(index)} />
        </View>
      );
    }}
    ListEmptyComponent={
      <Text style={[styles.empty, { color: theme.placeholder }]}>
      Поки що немає користувачів
      </Text>
    }
    />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  form: {
    marginBottom: 24,
    gap: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 4,
  },
  photoPreviewWrapper: {
    alignItems: 'center',
    marginVertical: 8,
  },
  photoPreview: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  photoButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    gap: 8,
  },
  photoButton: {
    flex: 1,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    gap: 8,
  },
  userName: {
    fontWeight: 'bold',
  },
  empty: {
    fontStyle: 'italic',
    color: '#888',
    marginTop: 8,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#1976d2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  themeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 8,
    marginBottom: 12,
  },
  addButton: {
    marginTop: 8,
    paddingVertical: 12,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1976d2', // можешь заменить на theme.accent, если захочешь
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  errorText: {
    marginBottom: 8,
    fontSize: 14,
  },

});
