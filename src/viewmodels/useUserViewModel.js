// src/viewmodels/useUserViewModel.js
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import User from '../models/User';

const STORAGE_KEY = 'users_mvvm_app';

export function useUserViewModel() {
  const [users, setUsers] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);
  const [loading, setLoading] = useState(true);

  // завантаження збережених користувачів
  useEffect(() => {
    async function loadUsers() {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const data = JSON.parse(raw);
          const restored = data.map(
            u => new User(u.name, u.email, u.phone, u.photoUri || null)
          );
          setUsers(restored);
        }
      } catch (e) {
        console.error('Failed to load users', e);
      } finally {
        setLoading(false);
      }
    }

    loadUsers();
  }, []);

  async function persist(nextUsers) {
    setUsers(nextUsers);
    try {
      const plain = nextUsers.map(u => ({
        name: u.name,
        email: u.email,
        phone: u.phone,
        photoUri: u.photoUri || null,
      }));
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(plain));
    } catch (e) {
      console.error('Failed to save users', e);
    }
  }

  function addUser(name, email, phone, photoUri = null) {
    const newUser = new User(name, email, phone, photoUri);
    const next = [...users, newUser];
    persist(next);
  }

  function updateUser(index, name, email, phone, photoUri = null) {
    const next = users.map((u, i) =>
    i === index ? new User(name, email, phone, photoUri) : u
    );
    persist(next);
  }

  function deleteUser(index) {
    const next = users.filter((_, i) => i !== index);

    // оновлюємо editingIndex, щоб не зламати режим редагування
    setEditingIndex(prev => {
      if (prev === null) return null;
      if (prev === index) return null;      // видалили саме того, кого редагували
      if (prev > index) return prev - 1;    // зрушуємо індекс на 1 вліво
      return prev;
    });

    persist(next);
  }

  function startEdit(index) {
    setEditingIndex(index);
  }

  function clearEdit() {
    setEditingIndex(null);
  }

  return {
    users,
    editingIndex,
    loading,
    addUser,
    updateUser,
    deleteUser,
    startEdit,
    clearEdit,
  };
}
