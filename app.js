const appData = {
    police: [],
    users: [],
    volunteers: [],
    reports: [],
    policeReports: [],
    volunteerReports: [],
    userNotifications: [],
    policeNotifications: [],
    volunteerNotifications: [],
    currentUser: null,
    currentReportId: null,
    editingReportId: null
};


// دوال EmailJS
function sendLoginNotification(toEmail, userName, report) {
    console.log('محاولة إرسال إيميل إلى:', toEmail);
    
    emailjs.send("service_sbkepx6", "template_m7905go", {
        to_email: toEmail,
        to_name: userName,
        missing_name: report.missingName,
        missing_age: report.missingAge,
        missing_type: report.missingType,
        last_call: report.lastCall,
        last_location: report.lastLocation,
        missing_height: report.missingHeight,
        missing_description: report.missingDescription,
        reporter_phone: report.reporterPhone,
        reporter_name: report.reporterName,
        additional_contact: report.additionalContact || 'لا يوجد'
    })
    .then(function(response) {
        console.log('تم إرسال الإيميل بنجاح', response.status, response.text);
        showCustomNotification('تم إرسال الإشعار بنجاح إلى ' + toEmail, 'success');
    })
    .catch(function(error) {
        console.log('فشل إرسال الإيميل', error);
        showCustomNotification('فشل إرسال الإيميل، تم استخدام النظام البديل', 'warning');
        sendAlternativeNotification(toEmail, report);
    });
}


function sendAlternativeNotification(email, report) {
    const backupNotification = {
        id: Date.now(),
        to: email,
        report: report,
        timestamp: new Date().toLocaleString('ar-EG'),
        type: 'backup'
    };


    let backups = JSON.parse(localStorage.getItem('emailBackups')) || [];
    backups.push(backupNotification);
    localStorage.setItem('emailBackups', JSON.stringify(backups));


    showCustomNotification('تم حفظ الإشعار في النظام البديل', 'info');
}


function showCustomNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 8px;
        color: white;
        font-weight: bold;
        z-index: 10000;
        max-width: 400px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        animation: slideIn 0.3s ease-out;
    `;


    if (type === 'success') {
        notification.style.backgroundColor = '#4CAF50';
    } else if (type === 'warning') {
        notification.style.backgroundColor = '#FF9800';
    } else if (type === 'error') {
        notification.style.backgroundColor = '#f44336';
    } else {
        notification.style.backgroundColor = '#2196F3';
    }


    notification.textContent = message;
    document.body.appendChild(notification);


    setTimeout(() => {
        notification.remove();
    }, 5000);
}


// دوال التسجيل والمستخدمين
function initializeSampleData() {
    // شرطة
    appData.police.push({
        id: 1,
        name: "شرطة الرياض",
        number: "0501234567",
        email: "police@example.com",
        password: "POLICE123"
    });


    // مستخدمين
    appData.users.push({
        id: 1,
        name: "أحمد محمد",
        email: "user@example.com",
        phone: "0551112222",
        password: "user123"
    });


    // متطوعين
    appData.volunteers.push({
        id: 1,
        name: "محمد علي",
        email: "volunteer@example.com",
        password: "volunteer123"
    });


    // بلاغات مع صور تجريبية
    appData.reports.push({
        id: 1,
        userId: "user@example.com",
        reporterName: "أحمد محمد",
        reporterPhone: "0551112222",
        additionalContact: "",
        userPhone2: "",
        missingName: "سارة أحمد",
        missingAge: "15 سنة",
        missingType: "أنثى",
        lastCall: "يوم الخميس 3 مساء",
        lastLocation: "مركز المدينة التجاري",
        missingHeight: "160 سم",
        missingDescription: "ترتدي فستان أزرق وتحمل حقيبة سوداء",
        status: "جديد",
        date: new Date().toLocaleDateString('ar-EG'),
        photo: "https://via.placeholder.com/200x200/4CAF50/FFFFFF?text=صورة+المفقود"
    });


    appData.reports.push({
        id: 2,
        userId: "user@example.com",
        reporterName: "أحمد محمد",
        reporterPhone: "0551112222",
        additionalContact: "0567890123",
        userPhone2: "",
        missingName: "خالد عبدالله",
        missingAge: "25 سنة",
        missingType: "ذكر",
        lastCall: "أمس الساعة 5 مساء",
        lastLocation: "حديقة الحيوانات",
        missingHeight: "175 سم",
        missingDescription: "يرتدي قميص أبيض وسروال جينز أزرق",
        status: "قيد العمل",
        date: new Date().toLocaleDateString('ar-EG'),
        photo: "https://via.placeholder.com/200x200/2196F3/FFFFFF?text=صورة+المفقود"
    });


    // تقارير شرطة تجريبية
    appData.policeReports.push({
        id: 1,
        reportId: 1,
        content: "تم البدء في البحث عن المفقودة في المنطقة المحددة",
        date: new Date().toLocaleString('ar-EG'),
        read: false
    });
}


function registerUser() {
    const name = document.getElementById('user-name').value;
    const email = document.getElementById('user-email').value;
    const phone = document.getElementById('user-phone').value;
    const password = document.getElementById('user-password').value;


    if (name && email && phone && password) {
        const newUser = {
            id: appData.users.length + 1,
            name: name,
            email: email,
            phone: phone,
            password: password
        };


        appData.users.push(newUser);
        alert("تم إنشاء الحساب بنجاح");
        showLogin('user');
    } else {
        alert("يرجى ملء جميع الحقول");
    }
}


function loginUser() {
    const email = document.getElementById('user-login-email').value;
    const password = document.getElementById('user-login-password').value;


    const user = appData.users.find(u => u.email === email && u.password === password);


    if (user) {
        appData.currentUser = user;
        showUserDashboard();
    } else {
        alert("البريد الإلكتروني أو كلمة المرور غير صحيحة");
    }
}


function showUserDashboard() {
    document.getElementById('main-page').classList.add('hidden');
    document.getElementById('user-dashboard').classList.remove('hidden');
    document.getElementById('user-welcome').textContent = 'مرحباً ' + appData.currentUser.name;
    document.getElementById('user-phone-display').textContent = appData.currentUser.phone;
    document.getElementById('user-email-display').textContent = appData.currentUser.email;
    document.getElementById('reporter-phone').value = appData.currentUser.phone;


    loadUserNotifications();
    loadUserReports();
    updateUserBadges();
}


// دوال إضافة البلاغ مع الصور
function addUserReport() {
    const missingName = document.getElementById('missing-name').value;
    const missingAge = document.getElementById('missing-age').value;
    const missingType = document.getElementById('missing-type').value;
    const lastCall = document.getElementById('last-call').value;
    const lastLocation = document.getElementById('last-location').value;
    const missingHeight = document.getElementById('missing-height').value;
    const missingDescription = document.getElementById('missing-description').value;
    const reporterPhone = document.getElementById('reporter-phone').value;
    const additionalContact = document.getElementById('additional-contact').value;
    const userPhone2 = document.getElementById('user-phone-2').value;
    const photoInput = document.getElementById('missing-photo');


    if (missingName && missingAge && lastLocation && reporterPhone) {
        let photoData = null;


        if (photoInput.files[0]) {
            const reader = new FileReader();
            reader.onload = function(e) {
                photoData = e.target.result;
                completeReportSubmission(photoData);
            };
            reader.readAsDataURL(photoInput.files[0]);
        } else {
            completeReportSubmission(null);
        }


        function completeReportSubmission(photo) {
            const newReport = {
                id: appData.reports.length + 1,
                userId: appData.currentUser.email,
                reporterName: appData.currentUser.name,
                reporterPhone: reporterPhone,
                additionalContact: additionalContact,
                userPhone2: userPhone2,
                missingName: missingName,
                missingAge: missingAge,
                missingType: missingType,
                lastCall: lastCall,
                lastLocation: lastLocation,
                missingHeight: missingHeight,
                missingDescription: missingDescription,
                status: "جديد",
                date: new Date().toLocaleDateString('ar-EG'),
                photo: photo
            };

appData.reports.push(newReport);
            sendPoliceNotification(`بلاغ جديد: ${missingName} - ${lastLocation}`);


            // إرسال إشعار المستخدم
            sendUserNotification(`تم إضافة بلاغك بنجاح عن ${missingName}`);


            document.getElementById('report-success').classList.remove('hidden');
            document.getElementById('add-report-form').reset();
            document.getElementById('photo-preview').classList.add('hidden');
            document.getElementById('reporter-phone').value = appData.currentUser.phone;


            setTimeout(() => {
                document.getElementById('report-success').classList.add('hidden');
            }, 5000);


            loadUserReports();
            updateUserBadges();


            alert("تم إضافة البلاغ بنجاح وإرسال الإشعار للشرطة");
        }
    } else {
        alert("يرجى ملء الحقول المطلوبة خاصة رقم الهاتف");
    }
}


// دوال الشرطة مع إصلاح عرض الصور
function registerPolice() {
    const name = document.getElementById('police-name').value;
    const number = document.getElementById('police-number').value;
    const email = document.getElementById('police-email').value;


    if (name && number && email) {
        const newPolice = {
            id: appData.police.length + 1,
            name: name,
            number: number,
            email: email,
            password: "POLICE123"
        };


        appData.police.push(newPolice);
        alert("تم إنشاء الحساب بنجاح. كلمة المرور: POLICE123");
        showLogin('police');
    } else {
        alert("يرجى ملء جميع الحقول");
    }
}


function loginPolice() {
    const email = document.getElementById('police-login-email').value;
    const password = document.getElementById('police-login-password').value;


    const police = appData.police.find(p => p.email === email && p.password === password);


    if (police) {
        appData.currentUser = police;
        showPoliceDashboard();
    } else {
        alert("البريد الإلكتروني أو كلمة المرور غير صحيحة");
    }
}


function showPoliceDashboard() {
    document.getElementById('main-page').classList.add('hidden');
    document.getElementById('police-dashboard').classList.remove('hidden');
    document.getElementById('police-welcome').textContent = 'مرحباً ' + appData.currentUser.name;


    loadPoliceData();
    loadPoliceNotifications();
    updatePoliceBadges();
}


function loadPoliceData() {
    loadReportsByStatus('new-reports-list', 'جديد');
    loadReportsByStatus('in-progress-reports-list', 'قيد العمل');
    loadReportsByStatus('resolved-reports-list', 'تم الحل');
    loadVolunteerReports();


    // تحديث قائمة البلاغات في نموذج رفع التقارير
    const reportCaseSelect = document.getElementById('report-case');
    if (reportCaseSelect) {
        reportCaseSelect.innerHTML = '<option value="">اختر البلاغ</option>';
        appData.reports.forEach(report => {
            const option = document.createElement('option');
            option.value = report.id;
            option.textContent = `${report.missingName} - ${report.date} - ${report.status}`;
            reportCaseSelect.appendChild(option);
        });
    }
}


function loadReportsByStatus(containerId, status) {
    const container = document.getElementById(containerId);
    if (!container) return;


    container.innerHTML = '';


    const filteredReports = appData.reports.filter(report => report.status === status);


    if (filteredReports.length === 0) {
        container.innerHTML = '<p>لا توجد بلاغات</p>';
        return;
    }


    filteredReports.forEach(report => {
        const reportItem = createPoliceReportItem(report);
        container.appendChild(reportItem);
    });
}


function createPoliceReportItem(report) {
    const reportItem = document.createElement('div');
    reportItem.className = `report-item status-${getStatusClass(report.status)}`;


    let actions = '';


    if (report.status === 'جديد') {
        actions = `<button class="btn btn-primary" onclick="updateReportStatus(${report.id}, 'قيد العمل')">بدء المتابعة</button>`;
    } else if (report.status === 'قيد العمل') {
        actions = `<button class="btn btn-success" onclick="updateReportStatus(${report.id}, 'تم الحل')">تم الحل</button>`;
    }


    // إضافة زر الاتصال بالمبلغ
    actions += `<button class="btn btn-success" onclick="contactReporter('${report.reporterPhone}', '${report.reporterName}')">📞 الاتصال بالمبلغ</button>`;


    reportItem.innerHTML = `
        <h3>${report.missingName}</h3>
        <p><strong>العمر:</strong> ${report.missingAge}</p>
        <p><strong>النوع:</strong> ${report.missingType}</p>
        <p><strong>آخر مكالمة:</strong> ${report.lastCall}</p>
        <p><strong>آخر مكان:</strong> ${report.lastLocation}</p>
        <p><strong>الطول:</strong> ${report.missingHeight}</p>
        <p><strong>الوصف:</strong> ${report.missingDescription}</p>
        <div class="contact-info">
            <h4>معلومات جهة الاتصال:</h4>
            <p><strong>اسم المبلغ:</strong> ${report.reporterName}</p>
            <p><strong>رقم الهاتف:</strong> ${report.reporterPhone}</p>
            ${report.additionalContact ? `<p><strong>رقم إضافي:</strong> ${report.additionalContact}</p>` : ''}
            ${report.userPhone2 ? `<p><strong>رقم هاتف إضافي للمستخدم:</strong> ${report.userPhone2}</p>` : ''}
        </div>
        ${report.photo ? `
        <div class="photo-preview-container">
            <h4>صورة المفقود:</h4>
            <img src="${report.photo}" class="case-image" alt="${report.missingName}">
        </div>
        ` : ''}
        <p><strong>الحالة:</strong> ${report.status}</p>
        <p><strong>التاريخ:</strong> ${report.date}</p>
        <div class="action-buttons">${actions}</div>
    `;


    return reportItem;
}


function getStatusClass(status) {
    switch(status) {
        case 'جديد': return 'new';
        case 'قيد العمل': return 'in-progress';
        case 'تم الحل': return 'resolved';
        default: return 'new';
    }
}


function updateReportStatus(reportId, newStatus) {
    const report = appData.reports.find(r => r.id === reportId);
    if (report) {
        const oldStatus = report.status;
        report.status = newStatus;


        // إرسال إشعار المستخدم عند تغيير حالة البلاغ
        if (oldStatus !== newStatus) {
            const user = appData.users.find(u => u.email === report.userId);
            if (user) {
                sendUserNotification(`تم تحديث حالة بلاغك عن ${report.missingName} من "${oldStatus}" إلى "${newStatus}"`, user.email);
            }
        }


        loadPoliceData();
        updatePoliceBadges();
        alert("تم تحديث حالة البلاغ إلى: " + newStatus);
    }
}


function contactReporter(phone, name) {
    showCustomNotification(`جاري الاتصال بـ ${name} على الرقم: ${phone}`, 'info');
}


// دوال المتطوعين مع إصلاح عرض البلاغات
function registerVolunteer() {
    const name = document.getElementById('volunteer-name').value;
    const email = document.getElementById('volunteer-email').value;
    const password = document.getElementById('volunteer-password').value;


    if (name && email && password) {
        const newVolunteer = {
            id: appData.volunteers.length + 1,
            name: name,
            email: email,
            password: password
        };


        appData.volunteers.push(newVolunteer);
        alert("تم إنشاء الحساب بنجاح");
        showLogin('volunteer');
    } else {
        alert("يرجى ملء جميع الحقول");
    }
}


function loginVolunteer() {
    const email = document.getElementById('volunteer-login-email').value;
    const password = document.getElementById('volunteer-login-password').value;


    const volunteer = appData.volunteers.find(v => v.email === email && v.password === password);


    if (volunteer) {
        appData.currentUser = volunteer;
        showVolunteerDashboard();
    } else {
        alert("البريد الإلكتروني أو كلمة المرور غير صحيحة");
    }
}


function showVolunteerDashboard() {
    document.getElementById('main-page').classList.add('hidden');
    document.getElementById('volunteer-dashboard').classList.remove('hidden');
    document.getElementById('volunteer-welcome').textContent = 'مرحباً ' + appData.currentUser.name;


    loadVolunteerData();
    loadVolunteerNotifications();
    updateVolunteerBadges();
}


function loadVolunteerData() {
    loadAllReports();
    loadMyVolunteerReports();
}


function loadAllReports() {
    const allReportsList = document.getElementById('all-reports-list');
    if (!allReportsList) return;


    allReportsList.innerHTML = '';


    // عرض البلاغات التي لم يتم حذفها من قبل الشرطة
    const visibleReports = appData.reports.filter(report => !report.hiddenFromVolunteers);


    if (visibleReports.length === 0) {
        allReportsList.innerHTML = '<p>لا توجد بلاغات</p>';
        return;
    }


    visibleReports.forEach(report => {
        const reportItem = document.createElement('div');
        reportItem.className = `report-item status-${getStatusClass(report.status)}`;
        reportItem.innerHTML = `
            <h3>${report.missingName}</h3>
            <p><strong>العمر:</strong> ${report.missingAge}</p>
            <p><strong>النوع:</strong> ${report.missingType}</p>
            <p><strong>آخر مكان:</strong> ${report.lastLocation}</p>
            <p><strong>الحالة:</strong> ${report.status}</p>
            <p><strong>التاريخ:</strong> ${report.date}</p>
            ${report.photo ? `
            <div class="photo-preview-container">
                <img src="${report.photo}" class="case-image" alt="صورة ${report.missingName}">
            </div>
            ` : ''}
            <div class="action-buttons">
                <button class="btn btn-primary" onclick="selectCaseForVolunteer(${report.id})">اختيار هذه الحالة</button>
            </div>
        `;
        allReportsList.appendChild(reportItem);
    });
}


function selectCaseForVolunteer(reportId) {
    document.getElementById('volunteer-case').value = reportId;
    showCaseDetails(reportId);
    showVolunteerSection('select-case');
}


function loadCasesForVolunteer() {
    const volunteerCaseSelect = document.getElementById('volunteer-case');
    if (volunteerCaseSelect) {
        volunteerCaseSelect.innerHTML = '<option value="">اختر حالة فقدان</option>';

// عرض البلاغات التي لم يتم حذفها من قبل الشرطة
        const visibleReports = appData.reports.filter(report => !report.hiddenFromVolunteers);


        visibleReports.forEach(report => {
            const option = document.createElement('option');
            option.value = report.id;
            option.textContent = `${report.missingName} - ${report.date} - ${report.status}`;
            volunteerCaseSelect.appendChild(option);
        });


        volunteerCaseSelect.onchange = function() {
            const caseId = this.value;
            if (caseId) {
                showCaseDetails(caseId);
            } else {
                document.getElementById('case-details').classList.add('hidden');
            }
        };
    }
}


function showCaseDetails(caseId) {
    const report = appData.reports.find(r => r.id == caseId);
    if (report) {
        const caseInfo = document.getElementById('case-info');
        caseInfo.innerHTML = `
            <div class="report-item">
                <h3>${report.missingName}</h3>
                <p><strong>العمر:</strong> ${report.missingAge}</p>
                <p><strong>النوع:</strong> ${report.missingType}</p>
                <p><strong>آخر مكالمة:</strong> ${report.lastCall}</p>
                <p><strong>آخر مكان:</strong> ${report.lastLocation}</p>
                <p><strong>الطول:</strong> ${report.missingHeight}</p>
                <p><strong>الوصف:</strong> ${report.missingDescription}</p>
                <p><strong>الحالة:</strong> ${report.status}</p>
                ${report.photo ? `
                <div class="photo-preview-container">
                    <h4>صورة المفقود:</h4>
                    <img src="${report.photo}" class="case-image" alt="${report.missingName}">
                </div>
                ` : ''}
            </div>
        `;
        document.getElementById('case-details').classList.remove('hidden');
        document.getElementById('volunteer-info').value = '';
    }
}


function submitVolunteerReport() {
    const caseId = document.getElementById('volunteer-case').value;
    const info = document.getElementById('volunteer-info').value;


    if (caseId && info) {
        const report = appData.reports.find(r => r.id == caseId);
        if (report) {
            const newVolunteerReport = {
                id: appData.volunteerReports.length + 1,
                reportId: parseInt(caseId),
                volunteerId: appData.currentUser.id,
                volunteerName: appData.currentUser.name,
                volunteerEmail: appData.currentUser.email,
                content: info,
                date: new Date().toLocaleString('ar-EG'),
                read: false
            };


            appData.volunteerReports.push(newVolunteerReport);
            // إرسال إشعار الشرطة
            sendPoliceNotification(`تقرير جديد من المتطوع ${appData.currentUser.name} عن الحالة: ${report.missingName}`);


            alert("تم إرسال التقرير بنجاح! تم إخطار الشرطة.");


            document.getElementById('volunteer-info').value = '';
            document.getElementById('case-details').classList.add('hidden');
            document.getElementById('volunteer-case').value = '';


            loadMyVolunteerReports();
            updateVolunteerBadges();
        }
    } else {
        alert("يرجى اختيار حالة وإدخال المعلومات");
    }
}


function loadMyVolunteerReports() {
    const myReportsList = document.getElementById('my-volunteer-reports-list');
    if (!myReportsList) return;


    myReportsList.innerHTML = '';


    const myReports = appData.volunteerReports.filter(report => report.volunteerId === appData.currentUser.id);


    if (myReports.length === 0) {
        myReportsList.innerHTML = '<p>لم تقم برفع أي تقارير بعد</p>';
    } else {
        myReports.forEach(vReport => {
            const report = appData.reports.find(r => r.id === vReport.reportId);
            if (report) {
                const reportItem = document.createElement('div');
                reportItem.className = 'report-item';
                reportItem.innerHTML = `
                    <h3>${report.missingName}</h3>
                    <p><strong>معلوماتك:</strong> ${vReport.content}</p>
                    <p><strong>تاريخ الإرسال:</strong> ${vReport.date}</p>
                    <p><strong>حالة البلاغ:</strong> ${report.status}</p>
                `;
                myReportsList.appendChild(reportItem);
            }
        });
    }
}


// دوال إشعارات الشرطة
function sendPoliceNotification(message) {
    const notification = {
        id: appData.policeNotifications.length + 1,
        message: message,
        type: 'info',
        date: new Date().toLocaleString('ar-EG'),
        read: false
    };


    appData.policeNotifications.push(notification);
    updatePoliceBadges();
}


function loadPoliceNotifications() {
    const notificationsList = document.getElementById('police-notifications-list');
    if (!notificationsList) return;


    notificationsList.innerHTML = '';


    if (appData.policeNotifications.length === 0) {
        notificationsList.innerHTML = '<p>لا توجد إشعارات</p>';
        return;
    }


    appData.policeNotifications.forEach(notification => {
        const notificationItem = document.createElement('div');
        notificationItem.className = `notification-item ${notification.read ? '' : 'unread'}`;
        notificationItem.innerHTML = `
            <p><strong>${notification.message}</strong></p>
            <p><small>${notification.date}</small></p>
            ${!notification.read ? `<button class="mark-read" onclick="markPoliceNotificationAsRead(${notification.id})">تمت المشاهدة</button>` : ''}
        `;
        notificationsList.appendChild(notificationItem);
    });
}


function markPoliceNotificationAsRead(notificationId) {
    const notification = appData.policeNotifications.find(n => n.id === notificationId);
    if (notification) {
        notification.read = true;
        loadPoliceNotifications();
        updatePoliceBadges();
    }
}


// دوال إشعارات المستخدم
function sendUserNotification(message, userEmail = null) {
    const targetEmail = userEmail || appData.currentUser.email;


    const notification = {
        id: appData.userNotifications.length + 1,
        userId: targetEmail,
        message: message,
        type: 'info',
        date: new Date().toLocaleString('ar-EG'),
        read: false
    };


    appData.userNotifications.push(notification);


    if (appData.currentUser && appData.currentUser.email === targetEmail) {
        loadUserNotifications();
        updateUserBadges();
    }
}


function loadUserNotifications() {
    const notificationsList = document.getElementById('user-notifications-list');
    if (!notificationsList) return;


    notificationsList.innerHTML = '';


    const userNotifications = appData.userNotifications.filter(n => n.userId === appData.currentUser.email);


    if (userNotifications.length === 0) {
        notificationsList.innerHTML = '<p>لا توجد إشعارات</p>';
        return;
    }


    userNotifications.forEach(notification => {
        const notificationItem = document.createElement('div');
        notificationItem.className = `notification-item ${notification.read ? '' : 'unread'}`;
        notificationItem.innerHTML = `
            <p><strong>${notification.message}</strong></p>
            <p><small>${notification.date}</small></p>
            ${!notification.read ? `<button class="mark-read" onclick="markUserNotificationAsRead(${notification.id})">تمت المشاهدة</button>` : ''}
        `;

notificationsList.appendChild(notificationItem);
    });
}


function markUserNotificationAsRead(notificationId) {
    const notification = appData.userNotifications.find(n => n.id === notificationId);
    if (notification) {
        notification.read = true;
        loadUserNotifications();
        updateUserBadges();
    }
}


// دوال إشعارات المتطوعين
function sendVolunteerNotification(message) {
    const notification = {
        id: appData.volunteerNotifications.length + 1,
        message: message,
        type: 'info',
        date: new Date().toLocaleString('ar-EG'),
        read: false
    };


    appData.volunteerNotifications.push(notification);
    updateVolunteerBadges();
}


function loadVolunteerNotifications() {
    const notificationsList = document.getElementById('volunteer-notifications-list');
    if (!notificationsList) return;


    notificationsList.innerHTML = '';


    if (appData.volunteerNotifications.length === 0) {
        notificationsList.innerHTML = '<p>لا توجد إشعارات</p>';
        return;
    }


    appData.volunteerNotifications.forEach(notification => {
        const notificationItem = document.createElement('div');
        notificationItem.className = `notification-item ${notification.read ? '' : 'unread'}`;
        notificationItem.innerHTML = `
            <p><strong>${notification.message}</strong></p>
            <p><small>${notification.date}</small></p>
            ${!notification.read ? `<button class="mark-read" onclick="markVolunteerNotificationAsRead(${notification.id})">تمت المشاهدة</button>` : ''}
        `;
        notificationsList.appendChild(notificationItem);
    });
}


function markVolunteerNotificationAsRead(notificationId) {
    const notification = appData.volunteerNotifications.find(n => n.id === notificationId);
    if (notification) {
        notification.read = true;
        loadVolunteerNotifications();
        updateVolunteerBadges();
    }
}


function loadVolunteerReports() {
    const container = document.getElementById('volunteer-reports-list');
    if (!container) return;


    container.innerHTML = '';


    const unreadVolunteerReports = appData.volunteerReports.filter(report => !report.read);


    if (unreadVolunteerReports.length === 0) {
        container.innerHTML = '<p>لا توجد تقارير جديدة من المتطوعين</p>';
        return;
    }


    unreadVolunteerReports.forEach(vReport => {
        const report = appData.reports.find(r => r.id === vReport.reportId);
        if (report) {
            const reportItem = document.createElement('div');
            reportItem.className = 'report-item';
            reportItem.innerHTML = `
                <h3>${report.missingName}</h3>
                <p><strong>اسم المتطوع:</strong> ${vReport.volunteerName}</p>
                <p><strong>بريد المتطوع:</strong> ${vReport.volunteerEmail}</p>
                <p><strong>المعلومات المقدمة:</strong> ${vReport.content}</p>
                <p><strong>تاريخ التقرير:</strong> ${vReport.date}</p>
                <div class="action-buttons">
                    <button class="btn btn-success" onclick="markVolunteerReportAsRead(${vReport.id})">تمت المشاهدة</button>
                    <button class="btn btn-primary" onclick="contactVolunteer('${vReport.volunteerEmail}', '${vReport.volunteerName}')">الاتصال بالمتطوع</button>
                </div>
            `;
            container.appendChild(reportItem);
        }
    });
}


function markVolunteerReportAsRead(reportId) {
    const volunteerReport = appData.volunteerReports.find(r => r.id === reportId);
    if (volunteerReport) {
        volunteerReport.read = true;
        loadVolunteerReports();
        updatePoliceBadges();
        showCustomNotification('تم تحديد التقرير كمقروء', 'success');
    }
}


function contactVolunteer(email, name) {
    showCustomNotification(`يمكنك التواصل مع المتطوع ${name} على البريد: ${email}`, 'info');
}


// دوال رفع تقارير الشرطة
function sendPoliceReport() {
    const caseId = document.getElementById('report-case').value;
    const content = document.getElementById('report-content').value;


    if (!caseId || !content) {
        alert('يرجى اختيار بلاغ وإدخال محتوى التقرير');
        return;
    }


    const report = appData.reports.find(r => r.id == caseId);
    if (report) {
        const policeReport = {
            id: appData.policeReports.length + 1,
            reportId: parseInt(caseId),
            policeName: appData.currentUser.name,
            content: content,
            date: new Date().toLocaleString('ar-EG'),
            read: false
        };


        appData.policeReports.push(policeReport);


        // إرسال إشعار للمستخدم
        const user = appData.users.find(u => u.email === report.userId);
        if (user) {
            sendUserNotification(`تحديث جديد من الشرطة على بلاغك عن ${report.missingName}: ${content}`, user.email);
        }


        document.getElementById('report-content').value = '';
        document.getElementById('report-case').value = '';


        showCustomNotification('تم إرسال التقرير بنجاح للمستخدم', 'success');
        updatePoliceBadges();
    }
}


// دوال تحديث العدادات
function updateUserBadges() {
    // تحديث عدد الإشعارات
    const userNotifications = appData.userNotifications.filter(n => 
        n.userId === appData.currentUser.email && !n.read
    );
    const notificationsBadge = document.getElementById('user-notifications-badge');
    if (notificationsBadge) {
        notificationsBadge.textContent = userNotifications.length;
        notificationsBadge.classList.toggle('hidden', userNotifications.length === 0);
    }


    // تحديث عدد تقارير الشرطة
    const policeReports = appData.policeReports.filter(pr => {
        const report = appData.reports.find(r => r.id === pr.reportId && r.userId === appData.currentUser.email);
        return report && !pr.read;
    });
    const policeReportsBadge = document.getElementById('police-reports-badge');
    if (policeReportsBadge) {
        policeReportsBadge.textContent = policeReports.length;
        policeReportsBadge.classList.toggle('hidden', policeReports.length === 0);
    }


    // تحديث عدد بلاغاتي
    const myReports = appData.reports.filter(r => r.userId === appData.currentUser.email);
    const myReportsBadge = document.getElementById('my-reports-badge');
    if (myReportsBadge) {
        myReportsBadge.textContent = myReports.length;
        myReportsBadge.classList.toggle('hidden', myReports.length === 0);
    }
}


function updatePoliceBadges() {
// تحديث عدد الإشعارات
    const unreadNotifications = appData.policeNotifications.filter(n => !n.read);
    const notificationsBadge = document.getElementById('police-notifications-badge');
    if (notificationsBadge) {
        notificationsBadge.textContent = unreadNotifications.length;
        notificationsBadge.classList.toggle('hidden', unreadNotifications.length === 0);
    }


    // تحديث عدد البلاغات الجديدة
    const newReports = appData.reports.filter(r => r.status === 'جديد');
    const newReportsBadge = document.getElementById('new-reports-badge');
    if (newReportsBadge) {
        newReportsBadge.textContent = newReports.length;
        newReportsBadge.classList.toggle('hidden', newReports.length === 0);
    }


    // تحديث عدد البلاغات قيد العمل
    const inProgressReports = appData.reports.filter(r => r.status === 'قيد العمل');
    const inProgressBadge = document.getElementById('in-progress-badge');
    if (inProgressBadge) {
        inProgressBadge.textContent = inProgressReports.length;
        inProgressBadge.classList.toggle('hidden', inProgressReports.length === 0);
    }


    // تحديث عدد البلاغات المحلولة
    const resolvedReports = appData.reports.filter(r => r.status === 'تم الحل');
    const resolvedBadge = document.getElementById('resolved-badge');
    if (resolvedBadge) {
        resolvedBadge.textContent = resolvedReports.length;
        resolvedBadge.classList.toggle('hidden', resolvedReports.length === 0);
    }


    // تحديث عدد تقارير المتطوعين
    const unreadVolunteerReports = appData.volunteerReports.filter(r => !r.read);
    const volunteerReportsBadge = document.getElementById('volunteer-reports-badge');
    if (volunteerReportsBadge) {
        volunteerReportsBadge.textContent = unreadVolunteerReports.length;
        volunteerReportsBadge.classList.toggle('hidden', unreadVolunteerReports.length === 0);
    }
}


function updateVolunteerBadges() {
    const unreadNotifications = appData.volunteerNotifications.filter(n => !n.read);
    const notificationsBadge = document.getElementById('volunteer-notifications-badge');
    if (notificationsBadge) {
        notificationsBadge.textContent = unreadNotifications.length;
        notificationsBadge.classList.toggle('hidden', unreadNotifications.length === 0);
    }


    const allReports = appData.reports.filter(r => !r.hiddenFromVolunteers);
    const allReportsBadge = document.getElementById('all-reports-badge');
    if (allReportsBadge) {
        allReportsBadge.textContent = allReports.length;
        allReportsBadge.classList.toggle('hidden', allReports.length === 0);
    }


    const myVolunteerReports = appData.volunteerReports.filter(r => 
        r.volunteerId === appData.currentUser.id
    );
    const myVolunteerReportsBadge = document.getElementById('my-volunteer-reports-badge');
    if (myVolunteerReportsBadge) {
        myVolunteerReportsBadge.textContent = myVolunteerReports.length;
        myVolunteerReportsBadge.classList.toggle('hidden', myVolunteerReports.length === 0);
    }
}


// دوال تحميل التقارير المستخدم
function loadUserReports() {
    loadMyReports();
    loadPoliceReportsForUser();
}


function loadMyReports() {
    const myReportsList = document.getElementById('my-reports-list');
    if (!myReportsList) return;


    myReportsList.innerHTML = '';


    const myReports = appData.reports.filter(r => r.userId === appData.currentUser.email);


    if (myReports.length === 0) {
        myReportsList.innerHTML = '<p>لم يتم إضافة أي بلاغات بعد</p>';
        return;
    }


    myReports.forEach(report => {
        const reportItem = document.createElement('div');
        reportItem.className = `report-item status-${getStatusClass(report.status)}`;
        reportItem.innerHTML = `
            <h3>${report.missingName}</h3>
            <p><strong>العمر:</strong> ${report.missingAge}</p>
            <p><strong>النوع:</strong> ${report.missingType}</p>
            <p><strong>آخر مكان:</strong> ${report.lastLocation}</p>
            <p><strong>الحالة:</strong> ${report.status}</p>
            <p><strong>التاريخ:</strong> ${report.date}</p>
            ${report.photo ? `
            <div class="photo-preview-container">
                <img src="${report.photo}" class="case-image" alt="${report.missingName}">
            </div>
            ` : ''}
            <div class="action-buttons">
                <button class="btn btn-primary" onclick="editUserReport(${report.id})">تعديل</button>
                <button class="btn btn-danger" onclick="deleteUserReport(${report.id})">حذف</button>
            </div>
            <div id="edit-form-${report.id}" class="edit-form hidden">
                <!-- سيتم تعبئته ديناميكياً -->
            </div>
        `;
        myReportsList.appendChild(reportItem);
    });
}


function loadPoliceReportsForUser() {
    const policeReportsList = document.getElementById('police-reports-list');
    if (!policeReportsList) return;


    policeReportsList.innerHTML = '';


    const userReports = appData.reports.filter(r => r.userId === appData.currentUser.email);
    const policeReportsForUser = appData.policeReports.filter(pr => {
        return userReports.some(ur => ur.id === pr.reportId);
    });


    if (policeReportsForUser.length === 0) {
        policeReportsList.innerHTML = '<p>لا توجد تقارير من الشرطة بعد</p>';
        return;
    }


    policeReportsForUser.forEach(pReport => {
        const report = appData.reports.find(r => r.id === pReport.reportId);
        if (report) {
            const reportItem = document.createElement('div');
            reportItem.className = 'report-item';
            reportItem.innerHTML = `
                <h3>تحديث من الشرطة على بلاغ ${report.missingName}</h3>
                <p><strong>محتوى التقرير:</strong> ${pReport.content}</p>
                <p><strong>مسؤول الشرطة:</strong> ${pReport.policeName}</p>
                <p><strong>التاريخ:</strong> ${pReport.date}</p>
                ${!pReport.read ? `<button class="btn btn-success" onclick="markPoliceReportAsRead(${pReport.id})">تمت المشاهدة</button>` : ''}
            `;
            policeReportsList.appendChild(reportItem);
        }
    });
}


function markPoliceReportAsRead(reportId) {
    const policeReport = appData.policeReports.find(r => r.id === reportId);
    if (policeReport) {
        policeReport.read = true;
        loadPoliceReportsForUser();
        updateUserBadges();
        showCustomNotification('تم تحديد التقرير كمقروء', 'success');
    }
}


// دوال إدارة بلاغات المستخدم
function editUserReport(reportId) {
    const report = appData.reports.find(r => r.id === reportId);
    if (!report) return;


    const editForm = document.getElementById(`edit-form-${reportId}`);
    if (editForm.classList.contains('hidden')) {
        editForm.innerHTML = `
            <h4>تعديل البلاغ</h4>
            <div class="form-group">
                <label for="edit-missing-name-${reportId}">اسم المفقود</label>
                <input type="text" id="edit-missing-name-${reportId}" value="${report.missingName}">
            </div>
            <div class="form-group">
                <label for="edit-missing-age-${reportId}">عمر المفقود</label>
                <input type="text" id="edit-missing-age-${reportId}" value="${report.missingAge}">
            </div>
            <div class="form-group">
                <label for="edit-last-location-${reportId}">آخر مكان</label>
                <input type="text" id="edit-last-location-${reportId}" value="${report.lastLocation}">
            </div>
            <div class="form-group">
                <label for="edit-missing-description-${reportId}">الوصف</label>
                <textarea id="edit-missing-description-${reportId}" rows="3">${report.missingDescription}</textarea>
            </div>
            <div class="action-buttons">
                <button class="btn btn-success" onclick="saveUserReport(${reportId})">حفظ</button>
                <button class="btn btn-danger" onclick="cancelEdit(${reportId})">إلغاء</button>
            </div>
        `;
        editForm.classList.remove('hidden');
    } else {
        editForm.classList.add('hidden');
    }
}


function saveUserReport(reportId) {
    const report = appData.reports.find(r => r.id === reportId);
    if (report) {
        report.missingName = document.getElementById(`edit-missing-name-${reportId}`).value;
        report.missingAge = document.getElementById(`edit-missing-age-${reportId}`).value;
        report.lastLocation = document.getElementById(`edit-last-location-${reportId}`).value;
        report.missingDescription = document.getElementById(`edit-missing-description-${reportId}`).value;


        // إرسال إشعار الشرطة بالتحديث
        sendPoliceNotification(`تم تحديث بلاغ عن ${report.missingName} من قبل المستخدم`);


        showCustomNotification('تم حفظ التعديلات بنجاح', 'success');
        loadMyReports();
        cancelEdit(reportId);
    }
}


function cancelEdit(reportId) {
    const editForm = document.getElementById(`edit-form-${reportId}`);
    editForm.classList.add('hidden');
}


function deleteUserReport(reportId) {
    if (confirm('هل أنت متأكد من حذف هذا البلاغ؟')) {
        const reportIndex = appData.reports.findIndex(r => r.id === reportId);
        if (reportIndex !== -1) {
            appData.reports.splice(reportIndex, 1);
            showCustomNotification('تم حذف البلاغ بنجاح', 'success');
            loadMyReports();
            updateUserBadges();
        }
    }
}


// دوال عرض الأقسام
function showPlatform(platform) {
    // إخفاء جميع محتويات المنصات
    document.querySelectorAll('.platform-content').forEach(content => {
        content.classList.remove('active');
    });


    // إخفاء جميع النماذج
    document.querySelectorAll('.form-container').forEach(form => {
        form.classList.add('hidden');
    });


    // إظهار المحتوى المحدد
    const platformContent = document.getElementById(`${platform}-content`);
    if (platformContent) {
        platformContent.classList.add('active');
    }
}


function showRegister(platform) {
    // إخفاء جميع النماذج أولاً
    document.querySelectorAll('.form-container').forEach(form => {
        form.classList.add('hidden');
    });


    // إظهار نموذج التسجيل المحدد
    const registerForm = document.getElementById(`${platform}-register`);
    if (registerForm) {
        registerForm.classList.remove('hidden');
    }


    // إخفاء محتويات المنصات
    document.querySelectorAll('.platform-content').forEach(content => {
        content.classList.remove('active');
    });
}


function showLogin(platform) {
    // إخفاء جميع النماذج أولاً
    document.querySelectorAll('.form-container').forEach(form => {
        form.classList.add('hidden');
    });


    // إظهار نموذج الدخول المحدد
    const loginForm = document.getElementById(`${platform}-login`);
    if (loginForm) {
        loginForm.classList.remove('hidden');
    }

// إخفاء محتويات المنصات
    document.querySelectorAll('.platform-content').forEach(content => {
        content.classList.remove('active');
    });
}


function showMainPage() {
    // إخفاء جميع لوحات التحكم
    document.getElementById('user-dashboard').classList.add('hidden');
    document.getElementById('police-dashboard').classList.add('hidden');
    document.getElementById('volunteer-dashboard').classList.add('hidden');


    // إظهار الصفحة الرئيسية
    document.getElementById('main-page').classList.remove('hidden');


    // إعادة تعيين المستخدم الحالي
    appData.currentUser = null;


    // إخفاء جميع النماذج
    document.querySelectorAll('.form-container').forEach(form => {
        form.classList.add('hidden');
    });


    // إخفاء محتويات المنصات
    document.querySelectorAll('.platform-content').forEach(content => {
        content.classList.remove('active');
    });
}


function showUserSection(section) {
    // إخفاء جميع أقسام المستخدم
    document.getElementById('add-report').classList.add('hidden');
    document.getElementById('police-reports').classList.add('hidden');
    document.getElementById('my-reports').classList.add('hidden');


    // إظهار القسم المحدد
    document.getElementById(section).classList.remove('hidden');
}


function showPoliceSection(section) {
    // إخفاء جميع أقسام الشرطة
    document.getElementById('new-reports').classList.add('hidden');
    document.getElementById('in-progress-reports').classList.add('hidden');
    document.getElementById('resolved-reports').classList.add('hidden');
    document.getElementById('volunteer-reports').classList.add('hidden');
    document.getElementById('upload-reports').classList.add('hidden');


    // إظهار القسم المحدد
    document.getElementById(section).classList.remove('hidden');


    // تحميل البيانات إذا لزم الأمر
    if (section === 'upload-reports') {
        loadCasesForPoliceReports();
    }
}


function showVolunteerSection(section) {
    // إخفاء جميع أقسام المتطوعين
    document.getElementById('all-reports').classList.add('hidden');
    document.getElementById('select-case').classList.add('hidden');
    document.getElementById('my-volunteer-reports').classList.add('hidden');


    // إظهار القسم المحدد
    document.getElementById(section).classList.remove('hidden');


    // تحميل البيانات إذا لزم الأمر
    if (section === 'select-case') {
        loadCasesForVolunteer();
    }
}


// دوال مساعدة إضافية
function loadCasesForPoliceReports() {
    const reportCaseSelect = document.getElementById('report-case');
    if (reportCaseSelect) {
        reportCaseSelect.innerHTML = '<option value="">اختر البلاغ</option>';
        appData.reports.forEach(report => {
            const option = document.createElement('option');
            option.value = report.id;
            option.textContent = `${report.missingName} - ${report.date} - ${report.status}`;
            reportCaseSelect.appendChild(option);
        });
    }
}


// إكمال دالة loadVolunteerNotifications التي كانت ناقصة
function loadVolunteerNotifications() {
    const notificationsList = document.getElementById('volunteer-notifications-list');
    if (!notificationsList) return;


    notificationsList.innerHTML = '';


    if (appData.volunteerNotifications.length === 0) {
        notificationsList.innerHTML = '<p>لا توجد إشعارات</p>';
        return;
    }


    appData.volunteerNotifications.forEach(notification => {
        const notificationItem = document.createElement('div');
        notificationItem.className = `notification-item ${notification.read ? '' : 'unread'}`;
        notificationItem.innerHTML = `
            <p><strong>${notification.message}</strong></p>
            <p><small>${notification.date}</small></p>
            ${!notification.read ? `<button class="mark-read" onclick="markVolunteerNotificationAsRead(${notification.id})">تمت المشاهدة</button>` : ''}
        `;
        notificationsList.appendChild(notificationItem);
    });
}


function markVolunteerNotificationAsRead(notificationId) {
    const notification = appData.volunteerNotifications.find(n => n.id === notificationId);
    if (notification) {
        notification.read = true;
        loadVolunteerNotifications();
        updateVolunteerBadges();
    }
}


// معالجة عرض الصور
document.getElementById('missing-photo').addEventListener('change', function(e) {
    const file = e.target.files[0];
    const preview = document.getElementById('photo-preview');


    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            preview.src = e.target.result;
            preview.classList.remove('hidden');
        };
        reader.readAsDataURL(file);
    } else {
        preview.classList.add('hidden');
    }
});


// تهيئة التطبيق
// تحميل البيانات المحفوظة من localStorage
function loadSavedData() {
    const savedData = localStorage.getItem("missingPersonsApp");
    if (savedData) {
        const parsedData = JSON.parse(savedData);
        Object.assign(appData, parsedData);
    } else {
        initializeSampleData();
    }
}


// حفظ البيانات إلى localStorage
function saveData() {
    localStorage.setItem("missingPersonsApp", JSON.stringify(appData));
}


// تهيئة البيانات عند تحميل الصفحة
window.addEventListener("load", function() {
    loadSavedData();
    
    // تحديث البيانات تلقائياً كل 30 ثانية
    setInterval(saveData, 30000);
    
    // حفظ البيانات قبل إغلاق الصفحة
    window.addEventListener("beforeunload", saveData);
});



