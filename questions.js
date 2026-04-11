let currentStep = 1;
const formData = {
    symptoms: [],
    duration: '',
    labs: { hb: null, tsh: null }
};

const nextBtn = document.getElementById('next-step-btn');
const formContent = document.getElementById('form-content');
const qTitle = document.getElementById('q-title');
const qSubtitle = document.getElementById('q-subtitle');
const qInfo = document.getElementById('q-info');
const stepInd = document.getElementById('step-indicator');

nextBtn.addEventListener('click', () => {
    if (currentStep === 1) {
        const selected = document.querySelectorAll('input[name="symptom"]:checked');
        if (selected.length === 0) return alert("Select at least one symptom.");
        formData.symptoms = Array.from(selected).map(s => s.value);
        loadStep2();
    } else if (currentStep === 2) {
        formData.duration = document.getElementById('duration').value;
        loadStep3();
    } else if (currentStep === 3) {
        formData.labs.hb = document.getElementById('hb')?.value;
        formData.labs.tsh = document.getElementById('tsh')?.value;
        processResult();
    }
});

function loadStep2() {
    currentStep = 2;
    stepInd.innerText = "STEP 2 OF 3";
    qTitle.innerText = "Symptom Duration";
    qSubtitle.innerText = "How long have you been experiencing these?";
    formContent.innerHTML = `
        <label>Duration Tracking [cite: 27]</label>
        <select id="duration" class="main-card input" style="width:100%; padding:10px; border-radius:8px;">
            <option value="mild">Less than 1 month</option>
            <option value="persistent">1 - 3 months</option>
            <option value="chronic">More than 3 months</option>
        </select>
    `;
    qInfo.innerText = "Symptom weighting is based on persistence and co-occurrence. [cite: 30]";
}

function loadStep3() {
    currentStep = 3;
    stepInd.innerText = "STEP 3 OF 3";
    qTitle.innerText = "Lab Refinement";
    qSubtitle.innerText = "Optional: Provide basic markers if available. [cite: 28]";
    formContent.innerHTML = `
        <label>Hemoglobin (g/dL)</label>
        <input type="number" id="hb" placeholder="e.g., 12" class="main-card input" style="width:100%; margin-bottom:15px;">
        <label>TSH Marker (mIU/L)</label>
        <input type="number" id="tsh" placeholder="e.g., 4.5" class="main-card input" style="width:100%;">
    `;
    qInfo.innerText = "Lab values refine the screening confidence for hormonal tendencies. [cite: 32]";
    nextBtn.innerText = "Generate Analysis";
}

function processResult() {
    // Rule-based screening engine [cite: 33]
    let tendency = "General Imbalance";
    let explanation = "Your symptoms are being normalization as lifestyle effects. [cite: 44]";

    if (formData.symptoms.includes('fatigue') && formData.labs.hb < 11.5) {
        tendency = "Iron-deficiency Anemia";
        explanation = "Persistent fatigue combined with low hemoglobin suggests nutritional anemia. [cite: 21]";
    } else if (formData.symptoms.includes('weight') && formData.labs.tsh > 4.5) {
        tendency = "Hypothyroidism";
        explanation = "Weight variation and elevated TSH indicate early thyroid tendencies. [cite: 21]";
    }

    // Output Layer [cite: 34-37]
    document.querySelector('.main-card').innerHTML = `
        <h2>Screening Result</h2>
        <div class="info-box" style="background:#fff0f5; border:1px solid #ff4d8d; margin-top:20px;">
            <h3 style="color:#ff4d8d; margin-bottom:5px;">${tendency}</h3>
            <p style="font-size:14px;">${explanation}</p>
        </div>
        <p style="font-size:12px; color:#666; margin-top:15px;">
            Objective: Improve early understanding before clinical consultation. [cite: 23]
        </p>
        <button class="next-btn" onclick="location.reload()" style="margin-top:20px;">New Assessment</button>
    `;
}