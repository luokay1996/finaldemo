let scannedResults = [];
const resultList = document.getElementById("result-list");
const counter = document.getElementById("counter");
const downloadBtn = document.getElementById("download-btn");
const clearBtn = document.getElementById("clear-btn");
const beepToggle = document.getElementById("beep-toggle");
const beepSound = new Audio("beep.mp3");

function updateCounter() {
  const count = scannedResults.length;
  const thung = Math.floor(count / 24);
  const chai = count % 24;
  counter.textContent = `${count} mã (${thung} thùng + ${chai} chai)`;
}

function addResult(result) {
  const timestamp = new Date().toLocaleTimeString();
  const li = document.createElement("li");
  li.textContent = `${timestamp} - ${result}`;
  resultList.prepend(li);
}

function isDuplicate(result) {
  return scannedResults.includes(result);
}

function handleScan(result) {
  if (!isDuplicate(result)) {
    scannedResults.push(result);
    addResult(result);
    updateCounter();
    saveToLocalStorage();
    if (beepToggle.checked) {
      beepSound.play();
    }
  }
}

function saveToLocalStorage() {
  localStorage.setItem("qr-results", JSON.stringify(scannedResults));
}

function loadFromLocalStorage() {
  const storedResults = localStorage.getItem("qr-results");
  if (storedResults) {
    scannedResults = JSON.parse(storedResults);
    scannedResults.forEach(addResult);
    updateCounter();
  }
}

function clearResults() {
  scannedResults = [];
  resultList.innerHTML = "";
  updateCounter();
  localStorage.removeItem("qr-results");
}

function exportToExcel() {
  if (scannedResults.length === 0) {
    alert("Không có dữ liệu để xuất.");
    return;
  }

  const data = scannedResults.map((code, index) => ({
    STT: index + 1,
    "Mã QR": code
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Danh sách mã QR");
  XLSX.writeFile(workbook, "qr_results.xlsx");
}

function startScanner() {
  const html5QrCode = new Html5Qrcode("reader");
  Html5Qrcode.getCameras().then(devices => {
    if (devices && devices.length) {
      const cameraId = devices[0].id;
      html5QrCode.start(
        { deviceId: { exact: cameraId } },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 }
        },
        handleScan,
        errorMessage => {
          // console.log("Lỗi quét:", errorMessage);
        }
      ).catch(err => {
        console.error("Không thể khởi động máy quét", err);
      });
    }
  });
}

// Khởi chạy
loadFromLocalStorage();
startScanner();
downloadBtn.addEventListener("click", exportToExcel);
clearBtn.addEventListener("click", clearResults);
