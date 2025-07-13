
          const urlParams = new URLSearchParams(window.location.search);
          const id = urlParams.get("id");

          fetch(`/Records/For/pdf/${id}`)
            .then(res => res.json())
            .then(data => {
              if (!data || data.error) return console.error("No record found");
            // English
document.getElementById("phone_number").innerHTML = data.Phone_number;
document.getElementById("Unified_no").innerHTML = data.unified_number;
document.getElementById("cr_no").innerHTML = data.customer_reference;
document.getElementById("date").innerHTML = data.expiry_date;
document.getElementById("Ref_no").innerHTML = data.reference_number;

// Arabic
document.getElementById("aphone_number").innerHTML = data.Phone_number;
document.getElementById("aUnified_no").innerHTML = data.unified_number;
document.getElementById("acr_no").innerHTML = data.customer_reference;
document.getElementById("adate").innerHTML = data.expiry_date;
document.getElementById("aRef_no").innerHTML = data.reference_number;


              const qrImg = document.getElementById("qrcode");
              qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(data.qrcode_url)}&size=150x150`;
              qrImg.alt = "QR Code";

              
            })
            .catch(err => {
              console.error("Error fetching record:", err);
            });