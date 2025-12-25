let appointments = JSON.parse(localStorage.getItem('cap_data')) || [];
let viewDate = new Date(2023, 0, 18);

function init() { 
    renderCalendar(); 
    renderDashboard(); 
    updateDocLabel(); 
}

function toggleSidebar() {
    const sb = document.getElementById('sidebar');
    const icon = document.getElementById('toggle-icon');
    sb.classList.toggle('collapsed');
    icon.innerText = sb.classList.contains('collapsed') ? '»' : '«';
}

function toggleMobileSidebar() {
    const sb = document.getElementById('sidebar');
    sb.classList.toggle('active-mobile');
}

function toggleDrawer() { 
    document.getElementById('side-drawer').classList.toggle('open'); 
}

function openBooking() {
    document.getElementById('modal-title').innerText = "Schedule Appointment";
    document.getElementById('edit-idx').value = "-1";
    document.getElementById('book-form').reset();
    document.getElementById('in-date').value = "";
    document.getElementById('in-time').value = "";
    document.getElementById('modal-overlay').classList.remove('hidden');
}

function closeModal() { 
    document.getElementById('modal-overlay').classList.add('hidden'); 
}

function switchTab(tab) {
    document.querySelectorAll('.page, .nav-item').forEach(el => el.classList.remove('active'));
    document.getElementById('page-' + tab).classList.add('active');
    document.getElementById('nav-' + tab).classList.add('active');
    document.getElementById('sidebar').classList.remove('active-mobile');
}

function updateDocLabel() {
    const label = document.getElementById('current-doc-name');
    label.innerText = appointments.length > 0 ? appointments[appointments.length - 1].doctor : "No Provider Selected";
}

function renderCalendar() {
    const grid = document.getElementById('calendar-grid');
    const header = document.getElementById('calendar-header');
    grid.innerHTML = ''; header.innerHTML = '';
    
    const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
    days.forEach(d => {
        const dayLabel = document.createElement('div');
        dayLabel.className = 'day-label';
        if (d === 'FRI') dayLabel.classList.add('highlight-blue');
        dayLabel.innerText = d;
        header.appendChild(dayLabel);
    });

    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    document.getElementById('month-display').innerText = `${monthNames[viewDate.getMonth()]} ${viewDate.getDate()}, ${viewDate.getFullYear()}`;

    const firstDay = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1).getDay();
    const daysInMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate();

    for(let i = 0; i < 35; i++) {
        const dayNum = i - firstDay + 1;
        const cell = document.createElement('div');
        cell.className = 'cell';
        if(dayNum > 0 && dayNum <= daysInMonth) {
            cell.innerHTML = `<span>${dayNum}</span>`;
            const dateStr = `${viewDate.getFullYear()}-${String(viewDate.getMonth()+1).padStart(2,'0')}-${String(dayNum).padStart(2,'0')}`;
            appointments.filter(a => a.date === dateStr).forEach(a => {
                const apptDiv = document.createElement('div');
                apptDiv.className = 'booked-appt';
                apptDiv.innerHTML = `
                    <div class="appt-header-text">🏃 ${a.patient} ${a.timeRange.split(' - ')[0]}</div>
                    <div class="appt-action-icons">
                        <span onclick="event.stopPropagation(); editAppt(${appointments.indexOf(a)})">✎</span>
                        <span>📄</span>
                        <span>⊕</span>
                    </div>`;
                cell.appendChild(apptDiv);
            });
        }
        grid.appendChild(cell);
    }
}

function renderDashboard() {
    const body = document.getElementById('dashboard-body'); body.innerHTML = '';
    const pSearch = document.getElementById('search-p').value.toLowerCase();
    const dSearch = document.getElementById('search-d').value.toLowerCase();
    const filtered = appointments.filter(a => a.patient.toLowerCase().includes(pSearch) && a.doctor.toLowerCase().includes(dSearch));

    if(filtered.length === 0) {
        body.innerHTML = '<tr><td colspan="7" style="text-align:center; padding:20px; color:#999;">No data found</td></tr>';
        return;
    }

    filtered.forEach((a) => {
        const realIdx = appointments.indexOf(a);
        body.innerHTML += `<tr>
            <td style="color:var(--primary-blue)">${a.patient}</td>
            <td style="color:var(--primary-blue)">${a.doctor}</td>
            <td>${a.hospital}</td><td>${a.specialty}</td>
            <td><div style="border:1px solid #ddd; padding:4px; border-radius:4px; display:inline-block;">${a.date.split('-').reverse().join('/')}</div></td>
            <td style="color:var(--primary-blue)">${a.timeRange}</td>
            <td>
                <img src="./Asserts/edit-text.png" class="action-icon icon-blue" style="margin-right:15px;" onclick="editAppt(${realIdx})" title="Edit">
                <img src="./Asserts/delete.png" class="action-icon" onclick="deleteAppt(${realIdx})" title="Delete">
            </td>
        </tr>`;
    });
}

function deleteAppt(idx) { 
    if(confirm('Delete this appointment?')) { 
        appointments.splice(idx, 1); 
        save(); 
    } 
}

function editAppt(idx) {
    const a = appointments[idx];
    document.getElementById('modal-title').innerText = "Update Appointment";
    document.getElementById('edit-idx').value = idx;
    document.getElementById('in-p').value = a.patient;
    document.getElementById('in-d').value = a.doctor;
    document.getElementById('in-h').value = a.hospital;
    document.getElementById('in-s').value = a.specialty;
    document.getElementById('in-date').value = a.date;
    document.getElementById('in-time').value = a.rawTime;
    document.getElementById('in-r').value = a.reason;
    document.getElementById('modal-overlay').classList.remove('hidden');
}

function save() {
    localStorage.setItem('cap_data', JSON.stringify(appointments));
    renderCalendar(); 
    renderDashboard(); 
    updateDocLabel();
}

function goToToday() { 
    viewDate = new Date(); 
    renderCalendar(); 
}

document.getElementById('book-form').onsubmit = (e) => {
    e.preventDefault();
    const idx = parseInt(document.getElementById('edit-idx').value);
    const time = document.getElementById('in-time').value;
    const date = document.getElementById('in-date').value;

    const d = new Date(); 
    const [hh, mm] = time.split(':');
    d.setHours(hh, mm);
    const range = d.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) + " - " + new Date(d.getTime() + 15*60000).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'});

    const data = {
        patient: document.getElementById('in-p').value, 
        doctor: document.getElementById('in-d').value,
        hospital: document.getElementById('in-h').value, 
        specialty: document.getElementById('in-s').value,
        date: date, 
        rawTime: time, 
        timeRange: range, 
        reason: document.getElementById('in-r').value
    };

    if(idx === -1) appointments.push(data); else appointments[idx] = data;
    save(); 
    closeModal();
};

function changeMonth(dir) { 
    viewDate.setMonth(viewDate.getMonth() + dir); 
    renderCalendar(); 
}

init();