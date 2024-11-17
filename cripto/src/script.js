const generate_keys = document.getElementById("Create-Keys");
const secure_chat = document.getElementById("Secure-Chat");
const container = document.getElementById("container");
const open = document.getElementById("open")
const confirm = document.getElementById("confirm")
const cancel = document.getElementById("cancel")
const modal_container = document.getElementById("modal-container")
const paswd = document.getElementById("contra1");

generate_keys.addEventListener("click", () => {
  container.classList.add("right-panel-active");
});

secure_chat.addEventListener("click", () => {
  container.classList.remove("right-panel-active");
});
