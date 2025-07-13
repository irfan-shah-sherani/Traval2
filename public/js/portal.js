const addPersonBtn = document.getElementById("addPersonBtn");
const addNewPerson = document.querySelector(".add-new");
const cancelPersonBtn = document.querySelector(".cancelbtn");
const submitPersonBtn = document.querySelector(".submit-person-btn");

addPersonBtn?.addEventListener("click", () => {
  addNewPerson.style.display = "block";
});

cancelPersonBtn?.addEventListener("click", () => {
  addNewPerson.style.display = "none";
});

submitPersonBtn?.addEventListener("click", () => {
  addNewPerson.style.display = "none";
});

fetch("/records")
.then((res) => {
  if (!res.ok) throw new Error("Network response was not ok");
  return res.json();
})
.then((data) => {
  const tbody = document.getElementById("person-table-body");
  const template = document.getElementById("record-template");

  data.forEach((record) => {
    const row = template.cloneNode(true);
    row.removeAttribute("id");
    row.style.display = "";

    row.querySelector(".room-name").textContent = record.room_name;
    row.querySelector(".facility-name").textContent = record.facility_name;
    row.querySelector(".facility-number").textContent = record.facility_number;
    row.querySelector(".request-number").textContent = record.request_number;
    row.querySelector(".request-type").textContent = record.request_type;
    row.querySelector(".applicant-name").textContent = record.applicant_name;
    row.querySelector(".creation-date").textContent = record.creation_date;
    row.querySelector(".request-amount").textContent = record.request_amount;
    row.querySelector(".expiry-date").textContent = record.expiry_date;
    row.querySelector(".record-number").textContent = record.record_number;
    row.querySelector(".request-status").textContent = record.request_status;
    row.querySelector(".reference-number").textContent = record.reference_number;
    row.querySelector(".passport-number").textContent = record.passport_number;

    // Set QR code image
    const qrImg = row.querySelector(".qr-img");
    qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(record.qrcode_url)}&size=100x100`;
    qrImg.alt = "QR Code";
    row.querySelector(".phone-number").textContent = record.Phone_number;
    row.querySelector(".customer-reference").textContent = record.customer_reference;
    row.querySelector(".unified-number").textContent = record.unified_number;

    row.querySelector(".pdf-link").href = `/downloadpdf/${record.record_id}`;
    // row.querySelector(".pdf-link").href = `/openpdf/?id=${record.record_id}`;

    // Delete form
    row.querySelector(".delete-form").action = `delete/${record.record_id}`;
  
    // Append row
    tbody.appendChild(row);
  });
})
.catch((err) => {
  console.error("Failed to fetch records:", err);
});