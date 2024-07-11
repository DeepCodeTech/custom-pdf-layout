const express = require('express');
const multer = require('multer');
const XLSX = require('xlsx');
const fs = require('fs');
const puppeteer = require('puppeteer');
const path = require('path');
const cors = require('cors');

const app = express();
const upload = multer({ dest: 'uploads/' });

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

function getBaseUrl(req) {
  return `${req.protocol}://${req.get('host')}`;
}

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/upload', upload.fields([
  { name: 'excelFile', maxCount: 1 },
  { name: 'imageFile1', maxCount: 1 },
  { name: 'imageFile2', maxCount: 1 },
  { name: 'imageFile3', maxCount: 1 },
  { name: 'imageFile4', maxCount: 1 },
  { name: 'imageFile5', maxCount: 1 },
  { name: 'image360File', maxCount: 1 },
  { name: 'imageLayout1', maxCount: 1 },
  { name: 'imageLayout2', maxCount: 1 },
  { name: 'imageLayout3', maxCount: 1 },
  { name: 'imageLayout4', maxCount: 1 },
]), async (req, res) => {
  try {
    const excelFilePath = req.files['excelFile'][0].path;
    const imageFilePath1 = req.files['imageFile1'] ? req.files['imageFile1'][0].path : null;
    const imageFilePath2 = req.files['imageFile2'] ? req.files['imageFile2'][0].path : null;
    const imageFilePath3 = req.files['imageFile3'] ? req.files['imageFile3'][0].path : null;
    const imageFilePath4 = req.files['imageFile4'] ? req.files['imageFile4'][0].path : null;
    const imageFilePath5 = req.files['imageFile5'] ? req.files['imageFile5'][0].path : null;
    const designerName = req.body.designerName;
    // const budgetCost = req.body.budgetCost;
    const roomType = req.body.roomType;
    // const furnitureQt = req.body.furnitureQt;
    const image360FilePath = req.files['image360File'] ? req.files['image360File'][0].path : null;
    const link360 = req.body.link360;
    const imageLayout1path = req.files['imageLayout1'] ? req.files['imageLayout1'][0].path : null;
    const imageLayout2path = req.files['imageLayout2'] ? req.files['imageLayout2'][0].path : null;
    const imageLayout3path = req.files['imageLayout3'] ? req.files['imageLayout3'][0].path : null;
    const imageLayout4path = req.files['imageLayout4'] ? req.files['imageLayout4'][0].path : null;

    const workbook = XLSX.readFile(excelFilePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

    let maxSerialNumber = -Infinity; // Initialize with a very small number

// Iterate through jsonData to find maximum serial number
jsonData.forEach((row, rowIndex) => {
  let serialNumber = row[0]; // Assuming serial number is in the first column (index 0)
  
  // Convert serialNumber to number and compare to find maximum
  if (!isNaN(serialNumber) && serialNumber > maxSerialNumber) {
    maxSerialNumber = serialNumber;
  }
});

let totalPrices = 0;

// Iterate through jsonData to calculate total prices
jsonData.forEach((row, rowIndex) => {
  let price = row[5]; // Assuming price is in the sixth column (index 5)
  
  // Convert price to number and add to totalPrices
  if (!isNaN(price)) {
    totalPrices += parseFloat(price);
  }
});

    let html = `
    <html lang="en">

<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="ie=edge" />
  <title>HTML + CSS</title>
  <link rel="stylesheet" href="styles.css" />
  <style>
    p{
        margin:0px;
    }
  </style>
</head>

<body style="width:360px; font-family:Futura; margin:0px;">
<div style="color:white; padding-top:79px; background-color:#1D2B3F;display:flex; flex-direction:column; align-items:center">
    <div>
    <svg width="100" height="19" viewBox="0 0 100 19" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M1.98831 5.84479C2.06259 5.84479 2.12544 5.78194 2.18257 5.65054C2.4454 4.98208 2.72536 4.4736 3.00532 4.10224C3.28529 3.7423 3.69095 3.46807 4.2166 3.29096C4.73653 3.11384 5.47358 3.02814 6.40488 3.02814V5.2049C6.22776 5.19347 5.98208 5.18205 5.66784 5.18205C4.35372 5.18205 3.43384 5.49056 2.91391 6.10188C2.39969 6.71892 2.13687 7.72445 2.13687 9.12992V14.5747H0V3.20526H2.13687V3.95941C2.13687 4.40504 2.05116 4.9021 1.89118 5.45057C1.86261 5.57055 1.85119 5.64482 1.85119 5.69624C1.85119 5.78765 1.88547 5.83336 1.95975 5.85621H1.98831V5.84479Z" fill="white"/>
<path d="M15.2144 3.80533C16.0543 4.31952 16.6943 5.03368 17.1399 5.93066C17.5856 6.82765 17.8084 7.81033 17.8084 8.89585C17.8084 9.98137 17.5856 10.9641 17.1399 11.861C16.6943 12.758 16.0601 13.4665 15.2144 13.9864C14.3746 14.5006 13.4032 14.7634 12.2948 14.7634C11.1864 14.7634 10.2094 14.5006 9.3752 13.9864C8.53531 13.4722 7.8954 12.758 7.44974 11.861C7.00408 10.9641 6.78125 9.98137 6.78125 8.89585C6.78125 7.81033 7.00408 6.82765 7.44974 5.93066C7.8954 5.03368 8.5296 4.32523 9.3752 3.80533C10.2151 3.29113 11.1864 3.02832 12.2948 3.02832C13.4032 3.02832 14.3803 3.29113 15.2144 3.80533ZM14.7574 11.6782C15.363 10.9355 15.6658 9.99851 15.6658 8.89014C15.6658 7.78176 15.3573 6.8505 14.7574 6.10206C14.1517 5.35934 13.3233 4.97655 12.2948 4.97655C11.2664 4.97655 10.4379 5.34791 9.83228 6.10206C9.22665 6.84479 8.92383 7.78176 8.92383 8.89014C8.92383 9.99851 9.22094 10.9298 9.83228 11.6782C10.4379 12.4209 11.2664 12.8037 12.2948 12.8037C13.3233 12.8037 14.1517 12.4324 14.7574 11.6782Z" fill="white"/>
<path d="M27.6754 3.80533C28.5153 4.31952 29.1552 5.03368 29.6008 5.93066C30.0465 6.82765 30.2693 7.81033 30.2693 8.89585C30.2693 9.98137 30.0465 10.9641 29.6008 11.861C29.1552 12.758 28.521 13.4665 27.6754 13.9864C26.8355 14.5006 25.8642 14.7634 24.7558 14.7634C23.6473 14.7634 22.6703 14.5006 21.8361 13.9864C20.9962 13.4722 20.3563 12.758 19.9107 11.861C19.465 10.9641 19.2422 9.98137 19.2422 8.89585C19.2422 7.81033 19.465 6.82765 19.9107 5.93066C20.3563 5.03368 20.9905 4.32523 21.8361 3.80533C22.676 3.29113 23.6473 3.02832 24.7558 3.02832C25.8642 3.02832 26.8412 3.29113 27.6754 3.80533ZM27.2183 11.6782C27.8239 10.9355 28.1268 9.99851 28.1268 8.89014C28.1268 7.78176 27.8182 6.8505 27.2183 6.10206C26.6127 5.35934 25.7842 4.97655 24.7558 4.97655C23.7273 4.97655 22.8989 5.34791 22.2932 6.10206C21.6876 6.84479 21.3848 7.78176 21.3848 8.89014C21.3848 9.99851 21.6819 10.9298 22.2932 11.6782C22.8989 12.4209 23.7273 12.8037 24.7558 12.8037C25.7842 12.8037 26.6127 12.4324 27.2183 11.6782Z" fill="white"/>
<path d="M47.0052 4.10215C47.708 4.81631 48.0565 6.00467 48.0565 7.64438V14.5803H45.9197V7.38728C45.9197 5.73043 45.1769 4.89629 43.6742 4.89629C42.1716 4.89629 42.8343 5.0277 42.4458 5.2848C42.0573 5.54761 41.7373 5.91897 41.4859 6.41031C41.2403 6.89594 41.1203 7.47298 41.1203 8.14143V14.5803H38.9834V7.64438C38.9834 6.74168 38.8234 6.05609 38.4978 5.5876C38.1721 5.11911 37.6579 4.89058 36.9437 4.89058C36.2295 4.89058 36.0409 5.05055 35.6124 5.35907C35.1839 5.6733 34.8354 6.11322 34.5783 6.68455C34.3154 7.25587 34.1898 7.90719 34.1898 8.62706V14.5803H32.0529V3.21088H34.1898V3.96503C34.1898 4.41067 34.104 4.89058 33.9441 5.41049C33.9441 5.43906 33.9326 5.48476 33.9098 5.55332C33.8869 5.62188 33.8869 5.6733 33.8984 5.71329C33.9098 5.74757 33.9384 5.77614 33.9898 5.78756H34.0526C34.1269 5.78756 34.184 5.73043 34.2297 5.61045C34.5097 4.82202 34.9554 4.19356 35.5781 3.7365C36.1952 3.26801 36.8808 3.03948 37.6522 3.03948C38.4235 3.03948 38.9834 3.26801 39.5148 3.71936C40.0461 4.17071 40.4004 4.75346 40.5604 5.46191C40.5889 5.58189 40.6632 5.63902 40.7832 5.63902C40.9032 5.63902 40.9774 5.58189 41.0289 5.46191C41.326 4.69062 41.7488 4.09644 42.303 3.67366C42.8572 3.25087 43.48 3.03948 44.177 3.03948C45.3483 3.03948 46.2853 3.39942 46.9824 4.11358L46.9995 4.10215H47.0052Z" fill="white"/>
<path d="M52.0735 11.6325C52.2678 11.981 52.5877 12.2781 53.0334 12.5238C53.479 12.7694 54.039 12.8894 54.7189 12.8894C55.7073 12.8894 56.4215 12.7295 56.8558 12.4209C57.2843 12.1067 57.5014 11.7296 57.5014 11.2897C57.5014 10.8498 57.3871 10.6727 57.1586 10.4784C56.93 10.2842 56.5644 10.1185 56.0673 10.0042C55.5702 9.88425 54.8674 9.78141 53.9418 9.69C52.5477 9.54145 51.5479 9.18723 50.9422 8.62732C50.3366 8.06171 50.0338 7.37041 50.0338 6.54198C50.0338 5.71356 50.2109 5.38219 50.5651 4.83943C50.9194 4.29667 51.4507 3.86246 52.1535 3.52538C52.8563 3.19401 53.7019 3.02832 54.696 3.02832C55.6902 3.02832 57.1586 3.38254 57.9585 4.07956C58.7584 4.7823 59.1983 5.6907 59.2726 6.79908H57.1871C57.1471 6.31345 56.9243 5.86782 56.5415 5.4736C56.1587 5.0851 55.5188 4.88513 54.6332 4.88513C53.7476 4.88513 53.1705 5.02797 52.7706 5.31934C52.3706 5.61072 52.1706 5.96494 52.1706 6.37058C52.1706 6.77623 52.3649 7.08474 52.7477 7.33041C53.1305 7.56466 53.9018 7.74748 55.056 7.86175C56.6215 8.02172 57.7756 8.34738 58.5184 8.83872C59.2554 9.32434 59.6268 10.0328 59.6268 10.9469C59.6268 11.861 59.1755 13.0208 58.2841 13.7121C57.3871 14.4034 56.1701 14.7462 54.6275 14.7462C53.0848 14.7462 51.9078 14.3749 51.0508 13.6379C50.1938 12.9009 49.7367 11.8896 49.6738 10.6213H51.7593C51.7707 10.9469 51.8793 11.284 52.0735 11.6268V11.6325Z" fill="white"/>
<path d="M64.5334 5.07338V11.0266C64.5334 11.6779 64.6362 12.1178 64.8305 12.3578C65.0247 12.592 65.4304 12.712 66.0417 12.712H67.7272V14.5746H65.8646C64.6705 14.5746 63.7906 14.3232 63.2307 13.8204C62.6822 13.3176 62.3908 12.4549 62.3908 11.238V5.06196H60.2539V3.19943H62.3908V0H64.5276V3.19943H67.7272V5.06196H64.5276V5.07338H64.5334Z" fill="white"/>
<path d="M77.2474 3.80515C78.0873 4.31934 78.7272 5.0335 79.1729 5.93049C79.6185 6.82747 79.8414 7.81015 79.8414 8.89567C79.8414 9.98119 79.6185 10.9639 79.1729 11.8609C78.7272 12.7578 78.093 13.4663 77.2474 13.9862C76.4075 14.5004 75.4362 14.7632 74.3278 14.7632C73.2194 14.7632 72.2423 14.5004 71.4082 13.9862C70.5683 13.472 69.9284 12.7578 69.4827 11.8609C69.037 10.9639 68.8142 9.98119 68.8142 8.89567C68.8142 7.81015 69.037 6.82747 69.4827 5.93049C69.9284 5.0335 70.5626 4.32506 71.4082 3.80515C72.2481 3.29096 73.2194 3.02814 74.3278 3.02814C75.4362 3.02814 76.4132 3.29096 77.2474 3.80515ZM76.7903 11.678C77.396 10.9353 77.6988 9.99834 77.6988 8.88996C77.6988 7.78159 77.3902 6.85032 76.7903 6.10188C76.1847 5.35916 75.3562 4.97637 74.3278 4.97637C73.2993 4.97637 72.4709 5.34773 71.8653 6.10188C71.2596 6.84461 70.9568 7.78159 70.9568 8.88996C70.9568 9.99834 71.2539 10.9296 71.8653 11.678C72.4709 12.4208 73.2993 12.8036 74.3278 12.8036C75.3562 12.8036 76.1847 12.4322 76.7903 11.678Z" fill="white"/>
<path d="M83.6172 5.84496C83.6915 5.84496 83.7543 5.78212 83.8115 5.65071C84.0743 4.98226 84.3543 4.47378 84.6342 4.10242C84.9142 3.74248 85.3199 3.46824 85.8455 3.29113C86.3654 3.11402 87.1025 3.02832 88.0338 3.02832V5.20508C87.8567 5.19365 87.611 5.18222 87.2967 5.18222C85.9826 5.18222 85.0627 5.49074 84.5428 6.10206C84.0286 6.71909 83.7658 7.72463 83.7658 9.13009V14.5748H81.6289V3.20543H83.7658V3.95958C83.7658 4.40522 83.6801 4.90227 83.5201 5.45075C83.4915 5.57073 83.4801 5.645 83.4801 5.69642C83.4801 5.78783 83.5144 5.83354 83.5887 5.85639H83.6172V5.84496Z" fill="white"/>
<path d="M93.943 11.6037C94.063 11.918 94.1201 12.3122 94.1201 12.7978C94.1201 13.2834 94.1315 12.9578 94.1544 13.0092C94.1773 13.0663 94.2287 13.0835 94.2972 13.0835C94.3658 13.0835 94.4172 13.0606 94.4401 13.0092C94.4629 12.9521 94.4744 12.8892 94.4744 12.7978C94.4744 12.3979 94.5372 11.9979 94.6686 11.6037L97.6225 3.21094H99.9308L95 15.9401C94.6001 16.9913 94.0973 17.7398 93.4916 18.1854C92.886 18.6311 92.0747 18.8539 91.052 18.8539H89.5893V16.9913H90.612C91.1605 16.9913 91.5833 16.9513 91.869 16.8714C92.1604 16.7857 92.3718 16.6657 92.5146 16.5057C92.6517 16.3457 92.7946 16.1058 92.926 15.7973L93.2402 15.0431L88.5723 3.22808H90.8805L93.9487 11.6209V11.6037H93.943Z" fill="white"/>
</svg>
    </div>
    <p style="font-size: 16px; font-weight: 400; line-height: 21.62px; text-align: center; padding-top:8px;">www.roomstory.ai</p>
    <div style="padding-top:88px; position:relative">
      <svg width=" 335" height="656" viewBox="0 0 335 656" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path fill="white" d="M9 648V181.892C9 86.4822 79.489 9 167.049 9C254.517 9 326 86.3809 326 181.892V643H325.907H317.383" stroke="#D9D9D9" stroke-width="17.2" stroke-miterlimit="10" />
        <g filter="url(#filter0_d_701_2416)">
          <path d="M109 613.207L14.0211 647.848L13.5 221.201C13.5001 122.648 47.9348 69.7795 63.5 67C91.5 62 108.479 122.418 108.479 196.894L109 613.021V613.207Z" fill="#708A5C" />
        </g>
        <path d="M61.3184 349.235C70.8306 349.235 78.5534 341.512 78.5534 332C78.5534 341.512 86.2761 349.235 95.7884 349.235C86.2761 349.235 78.5534 356.958 78.5534 366.47C78.5534 356.958 70.8306 349.235 61.3184 349.235Z" fill="white" />
        <defs>
          <filter id="filter0_d_701_2416" x="9.5" y="66.7104" width="103.5" height="589.138" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
            <feFlood flood-opacity="0" result="BackgroundImageFix" />
            <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
            <feOffset dy="4" />
            <feGaussianBlur stdDeviation="2" />
            <feComposite in2="hardAlpha" operator="out" />
            <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.38 0" />
            <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_701_2416" />
            <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_701_2416" result="shape" />
          </filter>
        </defs>
      </svg>
        <p style="position:absolute;top: 360px; left: 120px; color: black; font-size: 31px; font-weight: 600; line-height: 42px;">Welcome,</p>
        <p style="position:absolute;top: 400px; left: 120px; color: black;font-size: 31px; font-weight: 600; line-height: 42px;">Customer</p>
        <p style="position:absolute;top: 440px; left: 120px; color: black;font-size: 13px; font-weight: 400; line-height: 18.62px;">Your beautiful space awaits you!</p>
    </div>

  </div>
  <div style="padding:51px 16px 20px 16px;">
    <div style="display: flex;flex-direction: column; gap: 8px;">
    <p style="font-size: 16px; font-weight: 400; line-height: 21.62px; text-align: center; text-align:center;">www.roomstory.ai</p>
    <p style="font-size: 24px;padding-top:16px; font-weight: 500; line-height: 31.62px; text-align: center; padding-top:8px; text-align:center;">Design . Shop . Live</p>
    <p style="font-size: 14px; font-weight: 400; line-height: 18.62px; text-align: center;">Experience the modern bedroom design, where sleek aesthetics blend seamlessly with cozy comfort.</p>
    </div>
    <hr width="70%" style="margin-top:28px;"/>
    `;
    if (image360FilePath) {
        const base64Img360 = fs.readFileSync(image360FilePath, { encoding: 'base64' });
        const imageSrc = `data:image/jpeg;base64,${base64Img360}`;
        html += `<div id="360-image" style="height: 273px;margin-top:29px;margin-bottom: 20px;width: 328px;background-image:url('${imageSrc}'); background-size:cover; display: flex;align-items: center;justify-content: center;">
            <a style="text-decoration:none;color:inherit;" href='${link360}' target='_blank'><button style="display: flex;border:none;align-items: center;justify-content: center; background: black;color:white;gap:10px"><svg width="29" height="21" viewBox="0 0 29 21" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9.54372 19.3842L8.5298 18.4262L11.5873 15.5185C8.80715 15.1699 6.44944 14.5141 4.51419 13.5512C2.57895 12.5883 1.61133 11.493 1.61133 10.2654C1.61133 8.80754 2.86107 7.53977 5.36056 6.46214C7.86005 5.38452 10.9066 4.8457 14.5002 4.8457C18.0938 4.8457 21.1404 5.38452 23.6399 6.46214C26.1394 7.53977 27.3891 8.80754 27.3891 10.2654C27.3891 11.2491 26.738 12.1813 25.4357 13.062C24.1335 13.9427 22.3978 14.6193 20.2286 15.0917V13.7205C22.0665 13.2689 23.4809 12.7102 24.4719 12.0445C25.4629 11.3788 25.958 10.7857 25.957 10.2654C25.957 9.49042 24.9369 8.6192 22.8966 7.65178C20.8563 6.68435 18.0576 6.20064 14.5002 6.20064C10.9429 6.20064 8.14409 6.68435 6.10382 7.65178C4.06356 8.6192 3.04343 9.49042 3.04343 10.2654C3.04343 10.9122 3.83585 11.6353 5.42071 12.4347C7.00557 13.235 9.01146 13.8009 11.4384 14.1324L8.52837 11.3806L9.54086 10.4226L14.2782 14.9034L9.54372 19.3842Z" fill="white"/>
                </svg>
            <span>View in 360°</span>
        </button></a>
        </div>`
        fs.unlinkSync(image360FilePath); // Delete the uploaded image file
    }
    if (imageFilePath1) {
        const base64Image1 = fs.readFileSync(imageFilePath1, { encoding: 'base64' });
        const imageSrc1 = `data:image/jpeg;base64,${base64Image1}`;
        html += `<div id="first-image" style="height: 273px;background-image:url('${imageSrc1}'); background-size:cover; width: 328px; position: relative; position: relative;margin-bottom: 20px;">
        <p style="margin: 10px; position: absolute; font-size: 10px; font-weight: 300; line-height: 13.62px; opacity: 0.3;">roomstory</p>
        <p style="padding:5px;width: fit-content;position: absolute; left:10px;bottom: 10px;background-color: rgba(255, 255, 255, 0.7);">View 1</p>
        </div>`
        fs.unlinkSync(imageFilePath1); // Delete the uploaded image file
    }
    if (imageFilePath2) {
        const base64Image2 = fs.readFileSync(imageFilePath2, { encoding: 'base64' });
        const imageSrc2 = `data:image/jpeg;base64,${base64Image2}`;
        html += `<div id="second-image" style="height: 273px;background-image:url('${imageSrc2}'); background-size:cover; width: 328px; position: relative; position: relative; margin-top:29px;margin-bottom: 20px;">
        <p style="margin: 10px; position: absolute; font-size: 10px; font-weight: 300; line-height: 13.62px; opacity: 0.3;">roomstory</p>
        <p style="padding:5px;width: fit-content;position: absolute; left:10px;bottom: 10px;background-color: rgba(255, 255, 255, 0.7);">View 2</p>
        </div>`
        fs.unlinkSync(imageFilePath2); // Delete the uploaded image file
    }
    if (imageFilePath3) {
        const base64Image3 = fs.readFileSync(imageFilePath3, { encoding: 'base64' });
        const imageSrc3 = `data:image/jpeg;base64,${base64Image3}`;
        html += `<div id="third-image" style="height: 273px;background-image:url('${imageSrc3}'); background-size:cover; width: 328px; position: relative; position: relative; margin-top:29px;margin-bottom: 20px;">
        <p style="margin: 10px; position: absolute; font-size: 10px; font-weight: 300; line-height: 13.62px; opacity: 0.3;">roomstory</p>
        <p style="padding:5px;width: fit-content;position: absolute; left:10px;bottom: 10px;background-color: rgba(255, 255, 255, 0.7);">View 3</p>
        </div>`
        fs.unlinkSync(imageFilePath3); // Delete the uploaded image file
    }
    html+=`<div style="height: 176px; display: flex; gap: 17px;">`
    if (imageFilePath4) {
        const base64Image4 = fs.readFileSync(imageFilePath4, { encoding: 'base64' });
        const imageSrc4 = `data:image/jpeg;base64,${base64Image4}`;
        html += `<div id="fourth-image" style="background-image:url('${imageSrc4}'); background-size:cover; width: 156px; position: relative;">
        <p style="margin: 10px; position: absolute; font-size: 10px; font-weight: 300; line-height: 13.62px; opacity: 0.3;">roomstory</p>
        <p style="padding:5px;width: fit-content;position: absolute; left:10px;bottom: 10px;background-color: rgba(255, 255, 255, 0.7);">View 4</p>
        </div>`
        fs.unlinkSync(imageFilePath4); // Delete the uploaded image file
    }
    if (imageFilePath5) {
        const base64Image5 = fs.readFileSync(imageFilePath5, { encoding: 'base64' });
        const imageSrc5 = `data:image/jpeg;base64,${base64Image5}`;
        html += `<div id="fifth-image" style="background-image:url('${imageSrc5}'); background-size:cover; width: 156px; position: relative;">
        <p style="margin: 10px; position: absolute; font-size: 10px; font-weight: 300; line-height: 13.62px; opacity: 0.3;">roomstory</p>
        <p style="padding:5px;width: fit-content;position: absolute; left:10px;bottom: 10px;background-color: rgba(255, 255, 255, 0.7);">View 5</p>
        </div>`
        fs.unlinkSync(imageFilePath5); // Delete the uploaded image file
    }
    html +=`</div></div><div style="row-gap:30px; column-gap: 12px; position: relative; background:#F4F4F4;padding: 10px; display: grid; grid-template-columns: repeat(2,1fr);">
    <hr style="position: absolute; width: 90%;left: 14px; top:56px;">
    <hr style="position: absolute; width: 90%;left: 14px; top:122px;">
    <div style="display: flex; justify-content: normal; align-items: center; gap: 5px;">
        <div style="height: 28px; width: 28px; background-color: black; border-radius: 50%;">
        </div>
        <div style="display: flex; flex-direction: column;">
            <p style="font-size: 16px; font-weight: 500; line-height: 21.62px;">Designer</p> 
            <p style="font-size: 11px; font-weight: 400; line-height: 15.62px;color: #8A8A8A;">${designerName}</p>
            </div>
    </div>
    <div style="display: flex; justify-content: normal; align-items: center; gap: 5px;">
        <div>
            <svg width="21" height="20" viewBox="0 0 21 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M17.666 1.875H12.8652C12.716 1.87489 12.5727 1.93388 12.4668 2.03906L2.86914 11.6367C2.65899 11.8479 2.54101 12.1337 2.54101 12.4316C2.54101 12.7296 2.65899 13.0154 2.86914 13.2266L7.43945 17.7969C7.65064 18.007 7.93645 18.125 8.23438 18.125C8.53231 18.125 8.81811 18.007 9.0293 17.7969L18.623 8.20313C18.7282 8.09721 18.7872 7.95396 18.7871 7.80469V3C18.7878 2.85239 18.7594 2.7061 18.7033 2.56953C18.6473 2.43297 18.5648 2.30884 18.4606 2.20428C18.3564 2.09972 18.2326 2.0168 18.0962 1.96029C17.9598 1.90378 17.8136 1.87479 17.666 1.875Z" stroke="#272727" stroke-opacity="0.702" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M15.6641 6.25C15.4168 6.25 15.1752 6.17669 14.9696 6.03934C14.764 5.90199 14.6038 5.70676 14.5092 5.47835C14.4146 5.24995 14.3898 4.99861 14.4381 4.75614C14.4863 4.51366 14.6054 4.29093 14.7802 4.11612C14.955 3.9413 15.1777 3.82225 15.4202 3.77402C15.6627 3.72579 15.914 3.75054 16.1424 3.84515C16.3708 3.93976 16.566 4.09998 16.7034 4.30554C16.8408 4.5111 16.9141 4.75277 16.9141 5C16.9141 5.33152 16.7824 5.64946 16.5479 5.88388C16.3135 6.1183 15.9956 6.25 15.6641 6.25Z" fill="#272727" fill-opacity="0.702"/>
                </svg>                
        </div>
        <div style="display: flex; flex-direction: column;">
            <p style="font-size: 16px; font-weight: 500; line-height: 21.62px;">Budget</p>
            <p style="font-size: 11px; font-weight: 400; line-height: 15.62px;color: #8A8A8A;">Item Cost - <span>Rs ${totalPrices}/-</span></p>
        </div>
    </div>
    <div style="display: flex; justify-content: normal; align-items: center; gap: 5px;">
        <div>
            <svg width="21" height="21" viewBox="0 0 21 21" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M2.97266 18.5V17.5H5.10599V2.5H13.6393V3.5H16.8393V17.5H18.9727V18.5H15.7727V4.5H13.6393V18.5H2.97266ZM10.4393 11.27C10.6598 11.27 10.8518 11.1933 11.0153 11.04C11.1789 10.8867 11.2607 10.7067 11.2607 10.5C11.2607 10.2933 11.1789 10.1133 11.0153 9.96C10.8518 9.80667 10.6598 9.73 10.4393 9.73C10.2189 9.73 10.0269 9.80667 9.86332 9.96C9.69977 10.1133 9.61799 10.2933 9.61799 10.5C9.61799 10.7067 9.69977 10.8867 9.86332 11.04C10.0269 11.1933 10.2189 11.27 10.4393 11.27ZM6.17266 17.5H12.5727V3.5H6.17266V17.5Z" fill="#272727" fill-opacity="0.7"/>
                </svg>   
        </div>
        <div style="display: flex; flex-direction: column;">
            <p style="font-size: 16px; font-weight: 500; line-height: 21.62px;">Room Type</p>
            <p style="font-size: 11px; font-weight: 400; line-height: 15.62px;color: #8A8A8A;">${roomType}, 12ft X 15ft</p>
        </div>
    </div>
    <div style="display: flex; justify-content: normal; align-items: center; gap: 5px;">
        <div> 
                <svg width="21" height="21" viewBox="0 0 21 21" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <g clip-path="url(#clip0_712_429)">
                    <path d="M1 17V11.5455C1 11.2225 1.09007 10.8785 1.27022 10.5135C1.45037 10.1484 1.71215 9.87418 2.05556 9.69091V7.18182C2.05556 6.56655 2.25857 6.04909 2.66461 5.62945C3.07065 5.20982 3.57133 5 4.16667 5H8.91667C9.28048 5 9.59117 5.07745 9.84872 5.23236C10.1056 5.38655 10.3227 5.6 10.5 5.87273C10.6773 5.6 10.8944 5.38655 11.1513 5.23236C11.4088 5.07745 11.7195 5 12.0833 5H16.8333C17.4287 5 17.9294 5.20982 18.3354 5.62945C18.7414 6.04909 18.9444 6.56655 18.9444 7.18182V9.69091C19.2886 9.87418 19.5503 10.1484 19.7298 10.5135C19.9099 10.8785 20 11.2225 20 11.5455V17H18.9444V14.8182H2.05556V17H1ZM11.0278 9.36364H17.8889V7.18182C17.8889 6.87273 17.7876 6.61382 17.5849 6.40509C17.3822 6.19636 17.1317 6.09164 16.8333 6.09091H12.0833C11.7843 6.09091 11.5337 6.19564 11.3318 6.40509C11.1298 6.61455 11.0285 6.87345 11.0278 7.18182V9.36364ZM3.11111 9.36364H9.97222V7.18182C9.97222 6.87273 9.87089 6.61382 9.66822 6.40509C9.46556 6.19636 9.21504 6.09164 8.91667 6.09091H4.16667C3.86759 6.09091 3.61707 6.19564 3.41511 6.40509C3.21315 6.61455 3.11181 6.87345 3.11111 7.18182V9.36364ZM2.05556 13.7273H18.9444V11.5455C18.9444 11.2364 18.8431 10.9775 18.6404 10.7687C18.4378 10.56 18.1873 10.4553 17.8889 10.4545H3.11111C2.81204 10.4545 2.56152 10.5593 2.35956 10.7687C2.15759 10.9782 2.05626 11.2371 2.05556 11.5455V13.7273Z" fill="#272727" fill-opacity="0.702" stroke="#272727" stroke-opacity="0.702" stroke-width="0.2"/>
                    </g>
                    <defs>
                    <clipPath id="clip0_712_429">
                    <rect width="20" height="20" fill="white" transform="translate(0.664062 0.5)"/>
                    </clipPath>
                    </defs>
                    </svg>                
        </div>
        <div style="display: flex; flex-direction: column;">
            <p style="font-size: 16px; font-weight: 500; line-height: 21.62px;">Furniture Included</p>
            <p style="font-size: 11px; font-weight: 400; line-height: 15.62px;color: #8A8A8A;">${maxSerialNumber} items</p>
        </div>
    </div>
    <div style="display: flex; justify-content: normal; align-items: center; gap: 5px;">
        <div>
            <svg width="21" height="21" viewBox="0 0 21 21" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9.09375 12.25C9.09375 12.3743 9.04437 12.4935 8.95646 12.5815C8.86855 12.6694 8.74932 12.7188 8.625 12.7188C8.33492 12.7188 8.05672 12.6035 7.85161 12.3984C7.64649 12.1933 7.53125 11.9151 7.53125 11.625V8.5C7.53125 8.45856 7.51479 8.41882 7.48549 8.38951C7.45619 8.36021 7.41644 8.34375 7.375 8.34375C7.25068 8.34375 7.13146 8.29436 7.04355 8.20646C6.95564 8.11855 6.90625 7.99932 6.90625 7.875C6.90625 7.75068 6.95564 7.63145 7.04355 7.54354C7.13146 7.45564 7.25068 7.40625 7.375 7.40625C7.66508 7.40625 7.94328 7.52148 8.1484 7.7266C8.35352 7.93172 8.46875 8.20992 8.46875 8.5V11.625C8.46875 11.6664 8.48522 11.7062 8.51452 11.7355C8.54382 11.7648 8.58356 11.7812 8.625 11.7812C8.74932 11.7812 8.86855 11.8306 8.95646 11.9185C9.04437 12.0065 9.09375 12.1257 9.09375 12.25ZM7.6875 5.84375C7.84202 5.84375 7.99307 5.79793 8.12154 5.71209C8.25002 5.62624 8.35015 5.50423 8.40928 5.36147C8.46842 5.21872 8.48389 5.06163 8.45374 4.91009C8.4236 4.75854 8.34919 4.61933 8.23993 4.51007C8.13067 4.40081 7.99147 4.32641 7.83992 4.29626C7.68837 4.26612 7.53129 4.28159 7.38853 4.34072C7.24578 4.39985 7.12376 4.49998 7.03792 4.62846C6.95207 4.75694 6.90625 4.90798 6.90625 5.0625C6.90625 5.2697 6.98856 5.46841 7.13508 5.61493C7.28159 5.76144 7.4803 5.84375 7.6875 5.84375ZM15.9688 8.5C15.9688 10.0761 15.5014 11.6167 14.6258 12.9272C13.7502 14.2377 12.5056 15.259 11.0495 15.8622C9.59341 16.4653 7.99116 16.6231 6.44538 16.3156C4.89959 16.0082 3.4797 15.2492 2.36525 14.1348C1.2508 13.0203 0.491847 11.6004 0.184371 10.0546C-0.123105 8.50884 0.0347026 6.90659 0.637838 5.45049C1.24097 3.99439 2.26235 2.74984 3.5728 1.87423C4.88326 0.998609 6.42393 0.53125 8 0.53125C10.1127 0.533731 12.1381 1.37409 13.632 2.86798C15.1259 4.36188 15.9663 6.38732 15.9688 8.5ZM15.0313 8.5C15.0313 7.10935 14.6189 5.74993 13.8463 4.59365C13.0737 3.43736 11.9755 2.53615 10.6907 2.00397C9.40595 1.47179 7.9922 1.33255 6.62827 1.60385C5.26435 1.87516 4.0115 2.54482 3.02816 3.52816C2.04482 4.51149 1.37516 5.76434 1.10386 7.12827C0.832555 8.4922 0.971797 9.90595 1.50398 11.1907C2.03615 12.4755 2.93737 13.5737 4.09365 14.3463C5.24993 15.1189 6.60935 15.5312 8 15.5312C9.86417 15.5292 11.6514 14.7877 12.9696 13.4696C14.2877 12.1514 15.0292 10.3642 15.0313 8.5Z" fill="#272727" fill-opacity="0.7"/>
            </svg>                           
        </div>
        <div style="display: flex; flex-direction: column;">
            <p style="font-size: 16px; font-weight: 500; line-height: 21.62px;">Additional Info</p>
            <p style="font-size: 11px; font-weight: 400; line-height: 15.62px;color: #8A8A8A;">Anamika Gupta</p>
        </div>
    </div>
  </div>
  <div style="padding: 20px 16px 40px 16px; margin-top:20px; background-color: #F6f6f6;">
    <div style="display: flex; align-items:center; gap:10px">
        <p style="font-size: 32px; font-weight: 500; line-height: 42.62px;">Featured Products</p>
        <div style="height: 30px; display: flex; justify-content: center; align-items: center; color: white; width: 30px; border-radius: 50%; background-color: black;">
            <p>${maxSerialNumber}</p>
        </div>
    </div>
    <p style="font-size: 12px; font-weight: 400; line-height: 14.62px; padding-top: 12px;">
        Start shopping your favourite items featured in this design with just a few clicks.
    </p>
    <div style="display: grid; grid-template-columns:repeat(2,1fr); gap: 10px; padding-top: 24px;">`;

    jsonData.forEach((row, rowIndex) => {
        if (row[0] === undefined || row[0] === null || row[0] === '') {
            return; // Exit loop if cell1 is empty
        }
        if (rowIndex === 0) return; // Skip header row

        const [cell1, cell2, cell3, cell4, cell5, cell6] = row;
        let staticImagePath = '';
        if (cell4 && cell4.toLowerCase().includes("atom")) {
            staticImagePath = '/images/atom.svg';
        } else if (cell4 && cell4.toLowerCase().includes("asian")){
            staticImagePath = '/images/asianPaints.svg';
        } else if (cell4 && cell4.toLowerCase().includes("gulmohar")){
            staticImagePath = '/images/gulmohar.svg';
        } else if (cell4 && cell4.toLowerCase().includes("june")){
            staticImagePath = '/images/june.svg';
        } else if (cell4 && cell4.toLowerCase().includes("material")){
            staticImagePath = '/images/material.svg';
        } else if (cell4 && cell4.toLowerCase().includes("munn")){
            staticImagePath = '/images/munn.svg';
        } else if (cell4 && cell4.toLowerCase().includes("myntra")){
            staticImagePath = '/images/myntra.svg';
        } else if (cell4 && cell4.toLowerCase().includes("nice")){
            staticImagePath = '/images/nice.svg';
        } else if (cell4 && cell4.toLowerCase().includes("nyka")){
            staticImagePath = '/images/nyka.svg';
        } else if (cell4 && cell4.toLowerCase().includes("ladder")){
            staticImagePath = '/images/urban.svg';
        } else if (cell4 && cell4.toLowerCase().includes("whishpering")){
            staticImagePath = '/images/whispering.svg';
        }

        html += `<a style="text-decoration:none;color:inherit;" href="${cell5}" target='_blank'>
                    <div style="padding: 16px 17px 12px 10px; background:white; position: relative; gap: 12px; display: flex; flex-direction: column;">
                        <div style="top: 5px;left: 5px; position: absolute;height: 18px; display: flex; justify-content: center; align-items: center; color: black; width: 18px; border-radius: 50%; background-color: #8a8a8a66;">
                            <p id="cell1" style="font-size: 10px; font-weight: 500; line-height: 10.62px;">${cell1}</p>
                        </div>
                        <div style="display: flex; align-items: center; justify-content: center;">
                            <img id="cell3" src="${cell3}" alt="Image" style="height: 50px; width: 64px; background-color: red;" />
                        </div>
                        <div style="display: flex; flex-direction: column; gap: 5px;">
                            <div style="display: flex; height: 13px; gap: 5px;">
                                <div style="width: 12px; height: 12px; background-image:url('${staticImagePath}'); background-size:contain; background-repeat:no-repeat;"></div>
                                <p id="cell4" style="font-size: 10px; font-weight: 400; line-height: 12.62px; color: #8A8A8A;">${cell4}</p>
                            </div>
                            <p id="cell2" style="font-size: 12px; font-weight: 450; line-height: 15.62px;">${cell2}</p>
                            <p id="cell6" style="font-size: 12px; font-weight: 450; line-height: 15.62px; color: #8A8A8A;">₹ ${cell6}</p>
                        </div>
                        <button style="display: flex;font-family:Futura; align-items:center;border:none; gap: 10px; width: 96px;">
                            <svg width="11" height="12" viewBox="0 0 11 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M10.7324 3V10.5C10.7324 10.707 10.6934 10.9004 10.6152 11.0801C10.5371 11.2598 10.4297 11.418 10.293 11.5547C10.1562 11.6914 9.99609 11.7988 9.8125 11.877C9.62891 11.9551 9.43555 11.9961 9.23242 12H2.48242C2.27539 12 2.08203 11.9609 1.90234 11.8828C1.72266 11.8047 1.56445 11.6973 1.42773 11.5605C1.29102 11.4238 1.18359 11.2656 1.10547 11.0859C1.02734 10.9062 0.986328 10.7109 0.982422 10.5V3H2.48242V2.25C2.48242 1.94141 2.54102 1.65039 2.6582 1.37695C2.77539 1.10352 2.9375 0.865234 3.14453 0.662109C3.35156 0.458984 3.58984 0.298828 3.85938 0.181641C4.12891 0.0644531 4.41992 0.00390625 4.73242 0C5.13867 0 5.51562 0.101562 5.86328 0.304688C6.21094 0.101562 6.58398 0 6.98242 0C7.29102 0 7.58203 0.0585938 7.85547 0.175781C8.12891 0.292969 8.36719 0.455078 8.57031 0.662109C8.77344 0.869141 8.93359 1.10742 9.05078 1.37695C9.16797 1.64648 9.22852 1.9375 9.23242 2.25V3H10.7324ZM8.48242 2.25C8.48242 2.04688 8.44336 1.85352 8.36523 1.66992C8.28711 1.48633 8.17969 1.32812 8.04297 1.19531C7.90625 1.0625 7.74609 0.955078 7.5625 0.873047C7.37891 0.791016 7.18555 0.75 6.98242 0.75C6.80664 0.75 6.64062 0.779297 6.48438 0.837891C6.59766 0.978516 6.6875 1.11719 6.75391 1.25391C6.82031 1.39062 6.86914 1.52734 6.90039 1.66406C6.93164 1.80078 6.95312 1.93945 6.96484 2.08008C6.97656 2.2207 6.98242 2.37109 6.98242 2.53125V3H8.48242V2.25ZM3.23242 3H6.23242V2.25C6.23242 2.04688 6.19336 1.85352 6.11523 1.66992C6.03711 1.48633 5.92969 1.32812 5.79297 1.19531C5.65625 1.0625 5.49609 0.955078 5.3125 0.873047C5.12891 0.791016 4.93555 0.75 4.73242 0.75C4.52539 0.75 4.33203 0.789062 4.15234 0.867188C3.97266 0.945312 3.81445 1.05273 3.67773 1.18945C3.54102 1.32617 3.43359 1.48633 3.35547 1.66992C3.27734 1.85352 3.23633 2.04688 3.23242 2.25V3ZM7.93164 11.25C7.79883 11.0156 7.73242 10.7656 7.73242 10.5V3.75H1.73242V10.5C1.73242 10.6055 1.75195 10.7031 1.79102 10.793C1.83008 10.8828 1.88281 10.9609 1.94922 11.0273C2.01562 11.0938 2.0957 11.1484 2.18945 11.1914C2.2832 11.2344 2.38086 11.2539 2.48242 11.25H7.93164ZM9.98242 3.75H8.48242V10.5C8.48242 10.6055 8.50195 10.7031 8.54102 10.793C8.58008 10.8828 8.63281 10.9609 8.69922 11.0273C8.76562 11.0938 8.8457 11.1484 8.93945 11.1914C9.0332 11.2344 9.13086 11.2539 9.23242 11.25C9.33789 11.25 9.43555 11.2305 9.52539 11.1914C9.61523 11.1523 9.69336 11.0996 9.75977 11.0332C9.82617 10.9668 9.88086 10.8867 9.92383 10.793C9.9668 10.6992 9.98633 10.6016 9.98242 10.5V3.75Z" fill="#272727"/>
                            </svg>
                            <span style="font-size: 10px; font-weight: 500; line-height: 20.62px;">View Product</span>                 
                        </button>
                    </div>
                 </a>`;
    });

    html+=`</div></div>`

    html+=`<div style="background-color: #F6f6f6; padding: 0px 4px;">
    <p style="padding-left: 12px; padding-bottom: 24px; font-size: 32px; font-weight: 500; line-height: 42.62px;">Layouts</p>`;

    if (imageLayout1path) {
        const base64imageLayout1 = fs.readFileSync(imageLayout1path, { encoding: 'base64' });
        const imageSrcLayout1 = `data:image/jpeg;base64,${base64imageLayout1}`;
        html += `
        <div style="height: 240px; margin-bottom: 16px;background-image:url('${imageSrcLayout1}'); background-size:cover; position: relative;">
            <p style="margin: 10px; position: absolute; font-size: 10px; font-weight: 300; line-height: 13.62px; opacity: 0.3;">roomstory</p>
        </div>`;
        fs.unlinkSync(imageLayout1path); // Delete the uploaded image file
    }

    if (imageLayout2path) {
        const base64imageLayout2 = fs.readFileSync(imageLayout2path, { encoding: 'base64' });
        const imageSrcLayout2 = `data:image/jpeg;base64,${base64imageLayout2}`;
        html += `
        <div style="height: 240px; margin-bottom: 16px;background-image:url('${imageSrcLayout2}'); background-size:cover; position: relative;">
            <p style="margin: 10px; position: absolute; font-size: 10px; font-weight: 300; line-height: 13.62px; opacity: 0.3;">roomstory</p>
        </div>`;
        fs.unlinkSync(imageLayout2path); // Delete the uploaded image file
    }

    if (imageLayout3path) {
        const base64imageLayout3 = fs.readFileSync(imageLayout3path, { encoding: 'base64' });
        const imageSrcLayout3 = `data:image/jpeg;base64,${base64imageLayout3}`;
        html += `
        <div style="height: 240px; margin-bottom: 16px;background-image:url('${imageSrcLayout3}'); background-size:cover; position: relative;">
            <p style="margin: 10px; position: absolute; font-size: 10px; font-weight: 300; line-height: 13.62px; opacity: 0.3;">roomstory</p>
        </div>`;
        fs.unlinkSync(imageLayout3path); // Delete the uploaded image file
    }

    if (imageLayout4path) {
        const base64imageLayout4 = fs.readFileSync(imageLayout4path, { encoding: 'base64' });
        const imageSrcLayout4 = `data:image/jpeg;base64,${base64imageLayout4}`;
        html += `
        <div style="height: 240px; margin-bottom: 16px;background-image:url('${imageSrcLayout4}'); background-size:cover; position: relative;">
            <p style="margin: 10px; position: absolute; font-size: 10px; font-weight: 300; line-height: 13.62px; opacity: 0.3;">roomstory</p>
        </div>`;
        fs.unlinkSync(imageLayout4path); // Delete the uploaded image file
    }

    html += `</div>`
    
    html += `<div style="gap:19px; position: relative; background:#FFFFFF;padding: 16px; display: grid; grid-template-columns: repeat(2,1fr);">
    <div style="display: flex; flex-direction: column; gap: 5px;">
        <div style="height: 30px; width: 30px;">
            <svg width="24" height="30" viewBox="0 0 24 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.8103 15.75L13.5 6.43969C13.3612 6.2998 13.196 6.18889 13.014 6.11341C12.832 6.03792 12.6368 5.99938 12.4397 6.00001H3.75001C3.5511 6.00001 3.36033 6.07903 3.21968 6.21968C3.07903 6.36033 3.00001 6.5511 3.00001 6.75001V15.4397C2.99938 15.6368 3.03792 15.832 3.11341 16.014C3.18889 16.196 3.2998 16.3612 3.43969 16.5L12.75 25.8103C12.8893 25.9496 13.0547 26.0602 13.2367 26.1356C13.4187 26.211 13.6138 26.2498 13.8108 26.2498C14.0078 26.2498 14.2029 26.211 14.3849 26.1356C14.5669 26.0602 14.7323 25.9496 14.8716 25.8103L22.8103 17.8716C22.9496 17.7323 23.0602 17.5669 23.1356 17.3849C23.211 17.2029 23.2498 17.0078 23.2498 16.8108C23.2498 16.6138 23.211 16.4187 23.1356 16.2367C23.0602 16.0547 22.9496 15.8893 22.8103 15.75ZM13.8103 24.75L4.50001 15.4397V7.50001H12.4397L21.75 16.8103L13.8103 24.75ZM9.00001 10.875C9.00001 11.0975 8.93403 11.315 8.81041 11.5C8.68679 11.685 8.51109 11.8292 8.30553 11.9144C8.09996 11.9995 7.87376 12.0218 7.65553 11.9784C7.4373 11.935 7.23685 11.8278 7.07951 11.6705C6.92218 11.5132 6.81503 11.3127 6.77162 11.0945C6.72822 10.8763 6.75049 10.6501 6.83564 10.4445C6.92079 10.2389 7.06499 10.0632 7.24999 9.9396C7.435 9.81599 7.6525 9.75001 7.87501 9.75001C8.17338 9.75001 8.45952 9.86853 8.6705 10.0795C8.88148 10.2905 9.00001 10.5766 9.00001 10.875Z" fill="#272727"/>
                </svg>                
        </div>
        <div style="gap:5px; display: flex; flex-direction: column;">
            <p style="font-size: 14px; font-weight: 500; line-height: 18.62px;">Refer a Friend</p>
            <p style="font-size: 12px; font-weight: 400; line-height: 15.62px;">Refer a friend and get 15% off each other</p>
        </div>
    </div>
    <div style="display: flex; flex-direction: column; gap: 5px;">
        <div style="height: 30px; width: 30px;">
            <svg width="24" height="30" viewBox="0 0 24 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                <g clip-path="url(#clip0_712_526)">
                <path d="M19.814 18.8118C19.972 18.2628 20.026 
                17.6308 19.905 17.0988C19.785 16.5718 20.027 16.0108 
                20.506 15.7018C20.954 15.4118 21.319 15.0178 21.589 
                14.5298C21.844 14.0698 21.977 13.5398 21.975 13.0018C21.977 
                12.4598 21.844 11.9298 21.589 11.4698C21.318 10.9818 20.954 
                10.5878 20.505 10.2978C20.026 9.98878 19.785 9.42778 19.904 8.90178C20.026 8.36978 
                20.008 7.82078 19.85 7.27178C19.554 6.24178 18.731 5.41979 
                17.703 5.12579C17.156 4.96979 16.608 4.95079 16.075 5.07079C15.552 
                5.19179 14.988 4.94979 14.679 4.47079C14.389 
                4.02279 13.995 3.65879 13.508 3.38779C12.571 
                2.86879 11.408 2.86879 10.471 3.38779C9.983 3.65879 9.589 4.02379 9.3 4.47179C8.991 4.95079 
                8.428 5.19279 7.904 5.07179C7.371 4.95179 6.823 4.96979 6.276 5.12679C5.247 5.42179 4.424 6.24379 4.129 7.27379C3.972 7.82178 3.953 8.36978 4.074 8.90278C4.194 9.42878 3.953 
                9.98978 3.474 10.2988C3.025 10.5888 2.66 10.9838 2.391 11.4698C2.136 11.9298 2.003 12.4598 2.005 12.9988C2.003 13.5418 2.136 14.0718 2.391 14.5308C2.661 15.0178 3.025 15.4128 3.475 15.7028C3.954 16.0118 4.195 
                16.5728 4.075 17.0988C3.954 17.6318 4.012 18.2698 4.169 18.8188L-0.0149994 22.9998H3.987V27.0148L9.378 21.6238C9.66 
                22.0248 10.02 22.3628 10.47 22.6128C10.938 22.8718 11.463 23.0018 11.988 23.0018C12.513 23.0018 13.038 22.8718 13.507 22.6118C13.959 22.3608 14.321 22.0218 14.603 21.6178L20 27.0148V22.9998H24.002L19.814 18.8118ZM4.988 24.6008V21.9998H2.4L4.662 19.7368C5.067 20.2698 5.62 20.6858 6.275 20.8738C6.823 21.0308 7.372 21.0498 7.903 20.9288C8.139 20.8758 8.379 20.9038 8.604 20.9848L4.988 24.6008ZM13.839 20.9868C13.639 21.2958 13.365 21.5488 13.023 21.7378C12.395 22.0868 11.583 22.0868 10.956 
                21.7378C10.613 21.5488 10.339 21.2958 10.14 20.9868C9.698 20.3008 8.948 19.8988 8.173 19.8988C8.009 19.8988 7.845 19.9168 7.682 19.9538C7.316 20.0368 6.935 20.0238 6.551 19.9128C5.861 19.7158 5.288 19.1418 5.09 18.4528C4.98 18.0678 4.966 17.6868 5.049 17.3208C5.261 16.3858 4.846 15.3988 4.016 14.8628C3.706 14.6628 3.454 14.3878 3.265 14.0458C3.093 13.7358 3.003 13.3748 3.004 12.9988C3.003 12.6258 3.092 12.2658 3.265 11.9548C3.454 11.6128 3.707 11.3388 4.016 11.1388C4.847 10.6028 5.262 9.61579 5.049 8.68079C4.966 8.31479 4.98 7.93378 5.09 7.54878C5.288 6.85878 5.861 6.28579 6.551 6.08779C6.936 5.97879 7.317 5.96379 7.682 6.04679C8.616 6.25979 9.605 5.84479 10.14 5.01379C10.339 4.70479 10.613 4.45179 10.955 4.26279C11.583 3.91379 12.394 3.91479 13.022 4.26279C13.364 4.45279 13.639 4.70579 13.838 5.01379C14.373 5.84479 15.36 6.25679 16.296 6.04679C16.662 5.96379 17.043 5.97779 17.427 6.08779C18.117 6.28479 18.691 6.85878 18.889 7.54778C18.999 7.93279 19.013 8.31378 18.929 8.67978C18.717 9.61478 19.133 10.6018 19.962 11.1378C20.271 11.3378 20.524 11.6118 20.713 11.9548C20.885 12.2658 20.975 12.6268 20.974 13.0018C20.975 13.3738 20.886 13.7348 20.713 14.0448C20.524 14.3878 20.271 14.6618 19.962 14.8618C19.132 15.3968 18.716 16.3848 18.929 17.3198C19.012 17.6858 18.999 18.0668 18.888 18.4508C18.69 19.1408 18.116 19.7148 17.426 19.9118C17.042 20.0218 16.661 20.0358 16.295 19.9528C15.359 19.7428 14.372 20.1558 13.837 20.9858L13.839 20.9868ZM19.001 22.0008V24.6018L15.383 20.9838C15.606 20.9058 15.844 20.8768 16.076 20.9308C16.608 21.0508 17.156 21.0338 17.704 20.8758C18.361 20.6878 18.916 20.2688 19.321 19.7328L21.589 22.0008H19.001ZM16.693 10.8548L12.051 15.4968C11.726 15.8228 11.293 16.0018 10.832 16.0018C10.371 16.0018 9.939 15.8228 9.613 15.4968L6.807 12.6908L7.514 11.9838L10.32 14.7898C10.593 15.0628 11.07 15.0628 11.343 14.7898L15.985 10.1478L16.692 10.8548H16.693Z" fill="#272727"/>
                </g>
                <defs>
                <clipPath id="clip0_712_526">
                <rect width="24" height="24" fill="white" transform="translate(0 3)"/>
                </clipPath>
                </defs>
                </svg>                              
        </div>
        <div style="gap:5px; display: flex; flex-direction: column;">
            <p style="font-size: 14px; font-weight: 500; line-height: 18.62px;">Quality Assurance</p>
            <p style="font-size: 12px; font-weight: 400; line-height: 15.62px;">All products in designs are of the highest quality from trusted brands.</p>
        </div>
    </div>
    <div style="display: flex; flex-direction: column; gap: 5px;">
        <div style="height: 30px; width: 30px;">
            <svg width="24" height="30" viewBox="0 0 24 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8 13H6C5.46957 13 4.96086 13.2107 4.58579 13.5858C4.21071 13.9609 4 14.4696 4 15V22C4 22.5304 4.21071 23.0391 4.58579 23.4142C4.96086 23.7893 5.46957 24 6 24H18C18.5304 24 19.0391 23.7893 19.4142 23.4142C19.7893 23.0391 20 22.5304 20 22V15C20 14.4696 19.7893 13.9609 19.4142 13.5858C19.0391 13.2107 18.5304 13 18 13H16M8 13V10C8 8.93913 8.42143 7.92172 9.17157 7.17157C9.92172 6.42143 10.9391 6 12 6C13.0609 6 14.0783 6.42143 14.8284 7.17157C15.5786 7.92172 16 8.93913 16 10V13M8 13H16M12 17V20" stroke="#272727" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>                               
        </div>
        <div style="gap:5px; display: flex; flex-direction: column;">
            <p style="font-size: 14px; font-weight: 500; line-height: 18.62px;">Secure Payment</p>
            <p style="font-size: 12px; font-weight: 400; line-height: 15.62px;">100% safe money transaction</p>
        </div>
    </div>
    <div style="display: flex; flex-direction: column; gap: 5px;">
        <div style="height: 30px; width: 30px;">
            <svg width="24" height="30" viewBox="0 0 24 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22 20.002C21.9999 21.3697 21.5326 22.6962 20.6755 23.762C19.8183 24.8277 18.6228 25.5686 17.287 25.862L16.649 23.948C17.2333 23.852 17.789 23.6274 18.276 23.2906C18.763 22.9537 19.1691 22.5129 19.465 22H17C16.4696 22 15.9609 21.7893 15.5858 21.4142C15.2107 21.0391 15 20.5304 15 20V16C15 15.4696 15.2107 14.9609 15.5858 14.5858C15.9609 14.2107 16.4696 14 17 14H19.938C19.694 12.0669 18.7529 10.2893 17.2914 9.00068C15.8299 7.71208 13.9484 7.00108 12 7.00108C10.0516 7.00108 8.17007 7.71208 6.70857 9.00068C5.24708 10.2893 4.30603 12.0669 4.062 14H7C7.53043 14 8.03914 14.2107 8.41421 14.5858C8.78929 14.9609 9 15.4696 9 16V20C9 20.5304 8.78929 21.0391 8.41421 21.4142C8.03914 21.7893 7.53043 22 7 22H4C3.46957 22 2.96086 21.7893 2.58579 21.4142C2.21071 21.0391 2 20.5304 2 20V15C2 9.477 6.477 5 12 5C17.523 5 22 9.477 22 15V20.002ZM20 20V16H17V20H20ZM4 16V20H7V16H4Z" fill="#272727" stroke="white"/>
                </svg>                             
        </div>
        <div style="gap:5px; display: flex; flex-direction: column;">
            <p style="font-size: 14px; font-weight: 500; line-height: 18.62px;">Customer Service</p>
            <p style="font-size: 12px; font-weight: 400; line-height: 15.62px;">24x7 customer support available at +91 9179992032</p>
        </div>
    </div>
  </div>
  <div style="background-color: #f2f2f2; padding: 18px 18px 10px 18px;">
    <p style="font-size: 16px; font-weight: 600; line-height: 21.62px;">About</p>
    <p style="font-size: 14px; font-weight: 300; line-height: 28.62px; padding-top: 12px; padding-bottom: 24px;">Roomstory is an AI-powered interior design and sourcing platform. Our virtual platform provides personalized design options, customized to user preferences, along with a thoughtfully curated shopping list featuring products from renowned furniture brands.</p>
    <p style="font-size: 16px; font-weight: 600; line-height: 21.62px;">Contact us</p>
    <div style="padding-top: 12px;display: flex; gap: 12px; padding-bottom: 24px;">
        <div style="display: flex; align-items: center;">
            <div style="height: 24px; width: 24px;display: flex; align-items: center; justify-content: center;">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3.71398 5.25781C3.52298 3.99981 4.40998 2.86981 5.76498 2.45581C6.00544 2.38279 6.26467 2.40395 6.49011 2.515C6.71555 2.62604 6.89032 2.81867 6.97898 3.05381L7.41398 4.21381C7.48401 4.40042 7.49667 4.60371 7.45034 4.79757C7.40401 4.99143 7.30081 5.16702 7.15398 5.30181L5.85998 6.48681C5.79611 6.54529 5.74853 6.61934 5.72189 6.70173C5.69524 6.78412 5.69045 6.87201 5.70798 6.95681L5.71998 7.00881L5.75098 7.13881C5.91231 7.77033 6.15749 8.37739 6.47998 8.94381C6.8321 9.54523 7.26853 10.0931 7.77598 10.5708L7.81598 10.6068C7.88058 10.6642 7.95893 10.7038 8.04341 10.7218C8.12788 10.7399 8.21558 10.7357 8.29798 10.7098L9.97098 10.1828C10.1611 10.1231 10.3647 10.1216 10.5557 10.1784C10.7468 10.2353 10.9164 10.3479 11.043 10.5018L11.835 11.4628C12.165 11.8628 12.125 12.4508 11.746 12.8038C10.709 13.7708 9.28298 13.9688 8.29098 13.1718C7.07449 12.1915 6.04933 10.9951 5.26698 9.64281C4.47697 8.29228 3.95069 6.80443 3.71398 5.25781ZM6.75598 7.02281L7.82798 6.03881C8.12182 5.76935 8.32841 5.41821 8.42125 5.03049C8.51408 4.64276 8.48891 4.23613 8.34898 3.86281L7.91498 2.70281C7.73693 2.22958 7.38542 1.84187 6.93186 1.61843C6.47829 1.39499 5.95668 1.35258 5.47298 1.49981C3.78998 2.01481 2.43898 3.52381 2.72498 5.40881C2.92498 6.72481 3.38598 8.39881 4.40298 10.1468C5.24709 11.6049 6.35293 12.8948 7.66498 13.9518C9.15298 15.1468 11.139 14.7388 12.429 13.5368C12.7981 13.1931 13.0221 12.7215 13.0554 12.2183C13.0887 11.7151 12.9286 11.2181 12.608 10.8288L11.816 9.86681C11.5626 9.55929 11.2232 9.33446 10.8412 9.22114C10.4592 9.10783 10.052 9.1112 9.67198 9.23081L8.28298 9.66781C7.92432 9.29807 7.61018 8.88761 7.34698 8.44481C7.09299 7.99703 6.89485 7.51981 6.75698 7.02381" fill="#8A8A8A"/>
                </svg>
            </div>
            <p style="font-size: 14px; font-weight: 300; line-height: 28.62px;">+91 9179992032</p>
        </div>
        <div style="display: flex; align-items: center;">
            <div style="height: 24px; width: 24px;display: flex;gap: 3px; align-items: center; justify-content: center;">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M14.95 3.684L8.637 8.912C8.45761 9.06063 8.23196 9.14196 7.999 9.14196C7.76604 9.14196 7.54039 9.06063 7.361 8.912L1.051 3.684C1.01714 3.78591 0.999922 3.89261 1 4V12C1 12.2652 1.10536 12.5196 1.29289 12.7071C1.48043 12.8946 1.73478 13 2 13H14C14.2652 13 14.5196 12.8946 14.7071 12.7071C14.8946 12.5196 15 12.2652 15 12V4C15.0004 3.89267 14.9835 3.78597 14.95 3.684ZM2 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V12C16 12.5304 15.7893 13.0391 15.4142 13.4142C15.0391 13.7893 14.5304 14 14 14H2C1.46957 14 0.960859 13.7893 0.585786 13.4142C0.210714 13.0391 0 12.5304 0 12V4C0 3.46957 0.210714 2.96086 0.585786 2.58579C0.960859 2.21071 1.46957 2 2 2ZM1.79 3L7.366 7.603C7.54459 7.7505 7.76884 7.83144 8.00046 7.83199C8.23209 7.83254 8.45672 7.75266 8.636 7.606L14.268 3H1.79Z" fill="#8A8A8A"/>
                </svg>
            </div>
            <p style="font-size: 14px; font-weight: 300; line-height: 28.62px;">support@roomstory.ai</p>
        </div>
    </div>
    <div style="height: 24px; width: 104px; justify-content: space-between; display: flex;">
        <div style="height: 24px; width: 24px;">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9.19873 21.5H13.1987V13.49H16.8027L17.1987 9.51H13.1987V7.5C13.1987 7.23478 13.3041 6.98043 13.4916 6.79289C13.6792 6.60536 13.9335 6.5 14.1987 6.5H17.1987V2.5H14.1987C12.8727 2.5 11.6009 3.02678 10.6632 3.96447C9.72552 4.90215 9.19873 6.17392 9.19873 7.5V9.51H7.19873L6.80273 13.49H9.19873V21.5Z" fill="#708A5C"/>
                </svg>
        </div>
        <div style="height: 24px; width: 24px;">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M11.9991 7.19249C9.33898 7.19249 7.1921 9.33937 7.1921 11.9995C7.1921 14.6597 9.33898 16.8066 11.9991 16.8066C14.6593 16.8066 16.8062 14.6597 16.8062 11.9995C16.8062 9.33937 14.6593 7.19249 11.9991 7.19249ZM11.9991 15.1237C10.2788 15.1237 8.87492 13.7198 8.87492 11.9995C8.87492 10.2792 10.2788 8.87531 11.9991 8.87531C13.7194 8.87531 15.1234 10.2792 15.1234 11.9995C15.1234 13.7198 13.7194 15.1237 11.9991 15.1237ZM17.003 5.87531C16.3819 5.87531 15.8804 6.37687 15.8804 6.99796C15.8804 7.61906 16.3819 8.12062 17.003 8.12062C17.6241 8.12062 18.1257 7.6214 18.1257 6.99796C18.1259 6.85048 18.097 6.70441 18.0406 6.56812C17.9843 6.43183 17.9016 6.308 17.7973 6.20371C17.693 6.09943 17.5692 6.01674 17.4329 5.96039C17.2966 5.90403 17.1505 5.87512 17.003 5.87531ZM21.3694 11.9995C21.3694 10.7058 21.3812 9.42374 21.3085 8.13234C21.2359 6.63234 20.8937 5.30109 19.7968 4.20421C18.6976 3.10499 17.3687 2.76515 15.8687 2.69249C14.5749 2.61984 13.2929 2.63156 12.0015 2.63156C10.7077 2.63156 9.4257 2.61984 8.13429 2.69249C6.63429 2.76515 5.30304 3.10734 4.20617 4.20421C3.10695 5.30343 2.7671 6.63234 2.69445 8.13234C2.62179 9.42609 2.63351 10.7081 2.63351 11.9995C2.63351 13.2909 2.62179 14.5753 2.69445 15.8667C2.7671 17.3667 3.10929 18.698 4.20617 19.7948C5.30538 20.8941 6.63429 21.2339 8.13429 21.3066C9.42804 21.3792 10.7101 21.3675 12.0015 21.3675C13.2952 21.3675 14.5773 21.3792 15.8687 21.3066C17.3687 21.2339 18.6999 20.8917 19.7968 19.7948C20.896 18.6956 21.2359 17.3667 21.3085 15.8667C21.3835 14.5753 21.3694 13.2933 21.3694 11.9995ZM19.3069 17.5261C19.1359 17.9527 18.9296 18.2714 18.5991 18.5995C18.2687 18.93 17.9523 19.1362 17.5257 19.3073C16.2929 19.7972 13.3655 19.687 11.9991 19.687C10.6327 19.687 7.70304 19.7972 6.47023 19.3097C6.04367 19.1386 5.72492 18.9323 5.39679 18.6019C5.06632 18.2714 4.86007 17.955 4.68898 17.5284C4.20148 16.2933 4.31163 13.3659 4.31163 11.9995C4.31163 10.6331 4.20148 7.70343 4.68898 6.47062C4.86007 6.04406 5.06632 5.72531 5.39679 5.39718C5.72726 5.06906 6.04367 4.86046 6.47023 4.68937C7.70304 4.20187 10.6327 4.31203 11.9991 4.31203C13.3655 4.31203 16.2952 4.20187 17.528 4.68937C17.9546 4.86046 18.2734 5.06671 18.6015 5.39718C18.9319 5.72765 19.1382 6.04406 19.3093 6.47062C19.7968 7.70343 19.6866 10.6331 19.6866 11.9995C19.6866 13.3659 19.7968 16.2933 19.3069 17.5261Z" fill="#708A5C"/>
                </svg>                
        </div>
        <div style="height: 24px; width: 24px;">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path fill-rule="evenodd" clip-rule="evenodd" d="M12.5094 8.796V10.493C12.8648 9.95168 13.3546 9.5119 13.931 9.21671C14.5073 8.92152 15.1504 8.78103 15.7974 8.809C19.2524 8.809 19.9994 10.969 19.9994 13.779V19.5H16.7994V14.428C16.7994 13.218 16.5554 11.662 14.6714 11.662C12.8444 11.662 12.5324 12.979 12.5324 14.338V19.5H9.34238V8.796H12.5094ZM7.19938 6.106C7.19899 6.423 7.10502 6.73284 6.92926 6.99665C6.7535 7.26047 6.50377 7.46653 6.21138 7.589C5.91911 7.71048 5.5973 7.74226 5.28692 7.68029C4.97653 7.61832 4.6916 7.4654 4.46838 7.241C4.24475 7.01646 4.0925 6.73081 4.03077 6.41997C3.96905 6.10913 4.00061 5.78698 4.12149 5.49403C4.24237 5.20108 4.44717 4.95041 4.71013 4.77354C4.97309 4.59667 5.28248 4.5015 5.59938 4.5C5.81 4.5 6.01855 4.54158 6.21306 4.62236C6.40758 4.70315 6.58423 4.82154 6.73288 4.97075C6.88153 5.11996 6.99926 5.29705 7.07932 5.49186C7.15937 5.68668 7.20017 5.89538 7.19938 6.106Z" fill="#708A5C"/>
                <path d="M7.2 8.80859H4V19.4996H7.2V8.80859Z" fill="#708A5C"/>
                </svg>
                </div>
    </div>
    <div style="padding-top: 27px; display: flex; gap: 2px; align-items: center;">
        <div style="height: 24px; width: 24px;">
            <svg width="16" height="29" viewBox="0 0 16 29" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M15.1309 27.5925H0.864914V8.13509C0.864914 4.19762 4.05836 1 8 1C11.9375 1 15.1351 4.19344 15.1351 8.13509V27.5925H15.1309Z" fill="#1D2B3F" stroke="#1D2B3F" stroke-miterlimit="10"/>
                <path d="M14.0567 26.0543L0.864914 27.5967V8.13509C0.864914 4.19762 4.05836 1 8 1C11.3439 1 14.0567 3.71275 14.0567 7.05667V26.046V26.0543Z" fill="#708A5C"/>
                <path d="M9.46303 14.7894C10.7295 14.7894 11.7578 13.7611 11.7578 12.4946C11.7578 13.7611 12.786 14.7894 14.0526 14.7894C12.786 14.7894 11.7578 15.8176 11.7578 17.0842C11.7578 15.8176 10.7295 14.7894 9.46303 14.7894Z" fill="white"/>
            </svg>                
        </div>
        <p style="font-size: 16px; padding-top: 5px; font-weight: 500; line-height: 21.62px;">© 2024, roomstory interiors.</p>
    </div>
  </div>
  </body>
  </html>`;

    const outputPathHtml = path.join(__dirname, 'public', 'output.html');
    fs.writeFileSync(outputPathHtml, html);

    const outputPathPdf = path.join(__dirname, 'public', 'output.pdf');
    await convertHtmlToPdf(html, outputPathPdf);

    fs.unlinkSync(excelFilePath); // Delete the uploaded file

    const baseUrl = getBaseUrl(req);

    res.send(`
      <h1>File Processed</h1>
      <p><a href="${baseUrl}/output.html" target="_blank">View HTML</a></p>
      <p><a href="${baseUrl}/output.pdf" target="_blank">Download PDF</a></p>
    `);
  } catch (error) {
    console.error('Error processing file:', error);
    res.status(500).send('Error processing file');
  }
});

async function convertHtmlToPdf(htmlContent, outputPath) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
  const bodyHandle = await page.$('body');
  const boundingBox = await bodyHandle.boundingBox();

  // Generate the PDF with dynamic height
  await page.pdf({
    path: outputPath,
    width: `${boundingBox.width}px`,
    height: `${boundingBox.height}px`, // Set the height to match the HTML body
    printBackground: true,
  });
  await browser.close();
}

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
