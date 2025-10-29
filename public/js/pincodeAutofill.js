
  document.addEventListener("DOMContentLoaded", () => {
    const pincodeInput = document.getElementById('pincode');
    const cityInput = document.getElementById('city');
    const stateInput = document.getElementById('state');
    const countryInput = document.getElementById('country');
    const spinner = document.getElementById('spinner');
    const pincodeError = document.getElementById('pincodeError');

    let lastFetchedPincode = "";

    pincodeInput.addEventListener("input", async () => {
      const pincode = pincodeInput.value.trim();
      pincodeError.textContent = '';

      if (/^[1-9][0-9]{5}$/.test(pincode) && pincode !== lastFetchedPincode) {
        lastFetchedPincode = pincode;
        spinner.style.display = "inline-block";

        try {
          const response = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
          const data = await response.json();

          spinner.style.display = "none";

          if (data[0].Status === "Success") {
            const info = data[0].PostOffice[0];
            cityInput.value = info.District || "";
            stateInput.value = info.State || "";
            countryInput.value = "India";

            Toastify({
              text: `auto-fill working `,
              duration: 3000,
              gravity: "top",
              position: "right",
              backgroundColor: "#4CAF50",
            }).showToast();
          } else {
            pincodeError.textContent = "Invalid pincode! Please check and try again.";
            Toastify({
              text: "Invalid Pincode!",
              duration: 3000,
              gravity: "top",
              position: "right",
              backgroundColor: "#ff5f6d",
            }).showToast();

            cityInput.value = "";
            stateInput.value = "";
            countryInput.value = "India";
          }
        } catch (error) {
          spinner.style.display = "none";
          console.error(error);
          pincodeError.textContent = "Error fetching pincode information. Please try again.";
          Toastify({
            text: "Error fetching pincode info!",
            duration: 3000,
            gravity: "top",
            position: "right",
            backgroundColor: "#ff5f6d",
          }).showToast();
        }
      }

      // Reset if user clears or edits pincode
      if (pincode.length < 6) {
        spinner.style.display = "none";
        cityInput.value = "";
        stateInput.value = "";
        countryInput.value = "India";
      }
    });
  });

