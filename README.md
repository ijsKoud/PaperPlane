<div align="center">
    <img src="apps/web/public/logo/text.png" width="500px" />
    <h1>PaperPlane</h1>
  
  <p>An open-source customisable solution to storing files in the cloud. ✈️</p>
  
  <p align="center">
    <img alt="Version" src="https://img.shields.io/badge/version-4.1.12-blue.svg" />
    <a href="/LICENSE" target="_blank">
      <img alt="License: MIT" src="https://img.shields.io/badge/License-MIT-yellow.svg" />
    </a>
  </p>

  <a href="https://ijskoud.dev/discord" target="_blank">
    <img src="https://ijskoud.dev/discord/banner" />
  </a>
</div>

---

## Information

- Customisable ✏️
- Blazingly fast thanks to Next.js ⚡
- File uploading and URL shortening ☁️
- Password Protection for files 🔐
- Discord Embeds using OG Metadata 🔗
- 2FA Authentication to protect the vulnerable data 🔄️
- Gallery and Table viewing options 📃
- Support for multiple users using domains 🧑‍🤝‍🧑
- Clean and modern design 🖌️
- User invite-only mode 📨
- Backup import and export functionality 📂
- Easy install using Docker! 🚢

## Install

The following guide only shows you the Docker installation steps, for more details visit [the documentation page](https://paperplane.ijskoud.dev/). We are using `~/paperplane` as data folder, `paperplane` as name for the docker container and port `3000` (the first one and not the second one) here, you can customise all the options.

```bash
docker pull ghcr.io/ijskoud/paperplane:latest
docker run --name=paperplane -d -v ~/paperplane:/paperplane/data -p 3000:3000 ghcr.io/ijskoud/paperplane:latest
```

## Author

👤 **ijsKoud**

-   Website: https://ijskoud.dev/
-   Email: <hi@ijskoud.dev>
-   Twitter: [@ijsKoud](https://ijskoud.dev/twitter)
-   Github: [@ijsKoud](https://github.com/ijsKoud)

## Donate

This will always be open source project, even if I don't receive donations. But there are still people out there that want to donate, so if you do here is the link [PayPal](https://ijskoud.dev/paypal) or to [Ko-Fi](https://ijskoud.dev/kofi). Thanks in advance! I really appriciate it <3

## License

Project is licensed under the © [**MIT License**](/LICENSE)

---
