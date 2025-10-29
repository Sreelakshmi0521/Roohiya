//  ADDRESS MODAL HANDLING 

// Add Address Modal
const addModal = document.getElementById("addAddressModal");
const addForm = document.getElementById("addAddressForm");

// Edit Address Modal
const editModal = document.getElementById("editAddressModal");
const editForm = document.getElementById("editAddressForm");

const deleteModal = document.getElementById("deleteModal");

//  COMMON HELPERS 

function clearErrors() {
  document.querySelectorAll(".error-message").forEach(el => el.textContent = "");
}

//  ADD MODAL 

function openAddModal() {
  addModal.classList.add("show");
}

function closeAddModal() {
  addModal.classList.remove("show");
  addForm.reset();
  clearErrors();
}

//  EDIT MODAL 

function openEditModalBox() {
  editModal.classList.add("show");
}

function closeEditModal() {
  editModal.classList.remove("show");
  editForm.reset();
  clearErrors();
}

//ADD ADDRESS SUBMISSION 

addForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  clearErrors();

  const formData = {
    name: addForm.name.value.trim(),
    phone: addForm.phone.value.trim(),
    houseName: addForm.houseName.value.trim(),
    locality: addForm.locality?.value?.trim(),
    city: addForm.city?.value?.trim(),
    state: addForm.state?.value?.trim(),
    country: addForm.country?.value?.trim(),
    pincode: addForm.pincode?.value?.trim(),
    landmark: addForm.landmark?.value?.trim(),
    addressType: addForm.addressType?.value || "home",
  };

  try {
    const res = await axios.post("/user/addresses/add", formData);

    Toastify({
      text: res.data.message,
      backgroundColor: "#27ae60",
      duration: 3000
    }).showToast();

    closeAddModal();
    setTimeout(() => location.reload(), 800);
  } catch (error) {
    if (error.response?.data?.errors) {
      for (const [key, msg] of Object.entries(error.response.data.errors)) {
        const errEl = document.getElementById(`${key}Error`);
        if (errEl) errEl.textContent = msg;
      }
    } else {
      Toastify({
        text: "Something went wrong. Please try again.",
        backgroundColor: "#e74c3c",
        duration: 3000
      }).showToast();
    }
  }
});

//OPEN EDIT MODAL

async function openEditModal(id) {
  try {
    const res = await axios.get(`/user/addresses/${id}`);
    const data = res.data.address;

    openEditModalBox();

    document.getElementById("editAddressId").value = id;
    editForm.name.value = data.name;
    editForm.phone.value = data.phone;
    editForm.houseName.value = data.houseName;
    editForm.locality.value = data.locality;
    editForm.city.value = data.city;
    editForm.state.value = data.state;
    editForm.country.value = data.country;
    editForm.pincode.value = data.pincode;
    editForm.landmark.value = data.landmark || "";
    editForm.addressType.value = data.addressType || "home";
    editForm.isDefault.checked = data.isDefault || false;

  } catch (err) {
    Toastify({
      text: "Unable to fetch address details.",
      backgroundColor: "#e74c3c",
      duration: 3000
    }).showToast();
  }
}

//  EDIT FORM SUBMISSION 

editForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  clearErrors();

  const id = document.getElementById("editAddressId").value;

  const updated = {
    name: editForm.name.value.trim(),
    phone: editForm.phone.value.trim(),
    houseName: editForm.houseName.value.trim(),
    locality: editForm.locality?.value?.trim(),
    city: editForm.city?.value?.trim(),
    state: editForm.state?.value?.trim(),
    country: editForm.country?.value?.trim(),
    pincode: editForm.pincode?.value?.trim(),
    landmark: editForm.landmark?.value?.trim(),
    addressType: editForm.addressType?.value || "home",
    isDefault: editForm.isDefault.checked,
  };

  try {
    const updateRes = await axios.put(`/user/addresses/edit/${id}`, updated);

    Toastify({
      text: updateRes.data.message,
      backgroundColor: "#3498db",
      duration: 3000
    }).showToast();

    closeEditModal();
    setTimeout(() => location.reload(), 800);

  } catch (err) {
    if (err.response?.data?.errors) {
      for (const [key, msg] of Object.entries(err.response.data.errors)) {
        const errEl = document.getElementById(`${key}EditError`);
        if (errEl) errEl.textContent = msg;
      }
    } else {
      Toastify({
        text: "Error updating address!",
        backgroundColor: "#e74c3c",
        duration: 3000
      }).showToast();
    }
  }
});

//  DELETE ADDRESS 

let addressToDelete = null;

function openDeleteModal(id) {
  addressToDelete = id;
  deleteModal.classList.add("show");
}

function closeDeleteModal() {
  deleteModal.classList.remove("show");
}

document.getElementById("confirmDeleteBtn").addEventListener("click", async () => {
  if (!addressToDelete) return;
  try {
    await axios.delete(`/user/addresses/delete/${addressToDelete}`);
    Toastify({
      text: "Address deleted successfully",
      backgroundColor: "#e74c3c",
      duration: 2000,
    }).showToast();
    closeDeleteModal();
    setTimeout(() => location.reload(), 800);
  } catch (error) {
    Toastify({
      text: "Failed to delete address",
      backgroundColor: "#e74c3c",
      duration: 2000,
    }).showToast();
  }
});

//  SET DEFAULT ADDRESS 

async function setAsDefault(id) {
  try {
    const res = await axios.put(`/user/addresses/setDefault/${id}`);
    Toastify({
      text: res.data.message,
      backgroundColor: "#f39c12",
      duration: 3000
    }).showToast();
    setTimeout(() => location.reload(), 800);
  } catch (error) {
    Toastify({
      text: "Could not set as default",
      backgroundColor: "#e74c3c",
      duration: 2000
    }).showToast();
  }
}
