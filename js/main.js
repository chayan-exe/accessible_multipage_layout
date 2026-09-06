// Accessible interactions: keyboard-friendly menu, native dialogs, and forms.
document.addEventListener("DOMContentLoaded", () => {
  const menuButton = document.querySelector(".menu-toggle");
  const sidebar = document.querySelector("#sidebar");

  if (menuButton && sidebar) {
    menuButton.addEventListener("click", () => {
      const isOpen = menuButton.getAttribute("aria-expanded") === "true";
      menuButton.setAttribute("aria-expanded", String(!isOpen));
      sidebar.classList.toggle("is-open", !isOpen);
    });
  }

  document.querySelectorAll("[data-modal-target]").forEach((button) => {
    button.addEventListener("click", () => {
      const modal = document.getElementById(button.dataset.modalTarget);
      if (modal) {
        modal.showModal();
      }
    });
  });

  document.querySelectorAll("[data-close-modal]").forEach((button) => {
    button.addEventListener("click", () => {
      const modal = button.closest("dialog");
      if (modal) {
        modal.close();
      }
    });
  });

  const addUserForm = document.querySelector("#add-user-form");
  const formMessage = document.querySelector("#form-message");

  if (addUserForm && formMessage) {
    addUserForm.addEventListener("submit", (event) => {
      event.preventDefault();

      if (!addUserForm.checkValidity()) {
        addUserForm.reportValidity();
        return;
      }

      formMessage.textContent = "User details validated successfully.";
      addUserForm.reset();
    });
  }

  const settingsForm = document.querySelector("#settings-form");
  const settingsMessage = document.querySelector("#settings-message");

  if (settingsForm && settingsMessage) {
    settingsForm.addEventListener("submit", (event) => {
      event.preventDefault();

      if (!settingsForm.checkValidity()) {
        settingsForm.reportValidity();
        return;
      }

      settingsMessage.textContent = "Settings validated successfully.";
    });
  }
});
