// src/models/User.js

export default class User {
  constructor(name, email, phone, photoUri = null) {
    this.name = name;
    this.email = email;
    this.phone = phone;
    this.photoUri = photoUri; // шлях до фото (локальний URI)
  }
}
