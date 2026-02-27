# 🚗 EPA Appen – Mobile Front/Backend

A modern React Native & Expo mobile app for the EPA project.

![Mobile preview](mobile/assets/images/epa3.webp)

---

## 🚀 Quick Start

1. **Clone the repo**
   ```bash
   git clone https://github.com/tlxq/epa-appen.git
   cd epa-appen/mobile
   ```
2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```
3. **Run the app**

   ```bash
   npx expo start
   ```

   - Launch on iOS/Android emulator/simulator, or use Expo Go on your device.
   - Ensure your device and computer share the same Wi-Fi for live reloading.

---

## ✨ Features

- **Modern cross-platform app** built with [React Native](https://reactnative.dev/) & [Expo](https://expo.dev/)
- **Dark mode** support out of the box
- **User & admin authentication**
- **Map view** for finding gas stations and friends
- **Invites & registration** via custom backend
- **Works instantly with default API** at [`https://api.ttdevs.com`](https://api.ttdevs.com)

---

## 📝 Usage

- **Login:** Use provided test credentials, or register via invite.
- **User roles:** The app auto-directs you to user or admin panels based on your login.

---

## ⚡ Troubleshooting

- **Network issues?**
  - Double-check [`https://api.ttdevs.com`](https://api.ttdevs.com) is reachable.
  - Restart Expo: `npx expo start -c`
- **Cannot login/register?**
  - Contact the project admin for credentials or invite.
- **Device not updating?**
  - Reload the app in Expo Go, or clear cache.

---

## 🤝 Contributing

- Fork & PRs are welcome — see [CONTRIBUTING.md](CONTRIBUTING.md) if present.
- Please open issues with screenshots or error messages for faster help!
- For access or feature requests: contact the project owner.

---

## 📂 Project Structure (key folders & files)

```plaintext
.
├── backend
│   ├── .env                  # Backend config (secret)
│   ├── package.json          # Backend dependencies
│   ├── scripts/              # Admin/user creation scripts
│   └── src/
│       ├── api/auth          # Auth endpoints (invite, login, register)
│       ├── config            # DB config
│       ├── middleware        # Auth middleware
│       ├── routes            # Route definitions
│       ├── services          # Email and other services
│       └── utils             # Helper functions
│
├── docs
│   └── LOGIN.md              # Project documentation/guides
│
├── mobile
│   ├── app/                  # App screens (admin, auth, user, etc.)
│   ├── app.json              # Expo app config
│   ├── assets/images         # All app images/icons
│   ├── components/           # UI Components (e.g., themed-view, ui/)
│   ├── constants/            # Global configuration (theme etc)
│   ├── hooks/                # Custom React hooks
│   ├── scripts/              # Misc scripts for mobile
│   ├── .env                  # Optional: Expo env
│   ├── expo-env.d.ts         # Expo env TypeScript defs
│   ├── package.json
│   ├── tsconfig.json         # TypeScript config
│   └── README.md             # Mobile-specific readme
│
└── README.md                 # Main project readme
```

---

## 🖼️ Screenshots

> (Comming soon)

---

## License

MIT — see [LICENSE](../LICENSE) for details.

---

Enjoy!
