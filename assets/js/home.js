const profileImage = document.querySelector(".home-portrait__image");
const profileFallback = document.querySelector(".home-portrait__fallback");

if (profileImage && profileFallback) {
  profileImage.addEventListener("error", () => {
    profileImage.hidden = true;
    profileFallback.hidden = false;
  }, { once: true });

  if (profileImage.complete && profileImage.naturalWidth === 0) {
    profileImage.dispatchEvent(new Event("error"));
  }
}
