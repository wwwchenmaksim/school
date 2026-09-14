var appData = {
    children: ["Абдуллоев Иброхим Шарифович", "Антонова Евангелина Сергеевна", "Бордюгова Алиса Антоновна"],
    lessonsList: ["Нет урока", "РОВ (ВУД)", "Математика", "Русский язык", "Литературное чтение", "Физ-ра", "Окружающий мир", "Музыка", "ИЗО"],
    timeList: ["1 урок (08:30-09:10)", "2 урок (09:25-10:05)", "3 урок (10:25-11:05)"],
    mealsOptions: ["Не указано", "Комплекс", "Заказ", "С собой"],
    leaveOptions: ["Не указано", "После уроков (14:00)", "В кружок (16:00)", "ГПД до 18:00"],
    parentsOptions: ["Не указано", "Мама", "Папа", "Бабушка", "Сам(а) домой"],
    days: ["Понедельник", "Вторник", "Среда", "Четверг", "Пятница"],
    schedule: [
        { mon: "РОВ (ВУД)", tue: "Математика", wed: "Русский язык", thu: "Математика", fri: "Литературное чтение" },
        { mon: "Русский язык", tue: "Литературное чтение", wed: "Физ-ра", thu: "Русский язык", fri: "ИЗО" },
        { mon: "Математика", tue: "Русский язык", wed: "Окружающий мир", thu: "Музыка", fri: "Физ-ра" }
    ],
    records: {}
};

function getWeekKey(dateString) {
    var date = new Date(dateString);
    if (isNaN(date.getTime())) date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
    var week1 = new Date(date.getFullYear(), 0, 4);
    var weekNum = 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
    return date.getFullYear() + '-W' + (weekNum < 10 ? '0' + weekNum : weekNum);
}

function getWeekRangeDisplay(dateString) {
    var current = new Date(dateString);
    if (isNaN(current.getTime())) current = new Date();
    current.setDate(current.getDate() - (current.getDay() === 0 ? 6 : current.getDay() - 1));
    var start = current.toLocaleDateString('ru-RU');
    current.setDate(current.getDate() + 4);
    var end = current.toLocaleDateString('ru-RU');
    return "Рабочая неделя: " + start + " — " + end;
}

document.appsferaTab = function(tabId, btnElement) {
    var tabs = document.querySelectorAll('.school-app .tab-content');
    tabs.forEach(function(tab) { tab.style.setProperty('display', 'none', 'important'); tab.classList.remove('active'); });
    var buttons = document.querySelectorAll('.school-app .mobile-nav .nav-btn');
    buttons.forEach(function(btn) { btn.classList.remove('active'); });
    var targetTab = document.getElementById(tabId);
    if (targetTab) { targetTab.style.setProperty('display', 'block', 'important'); targetTab.classList.add('active'); }
    btnElement.classList.add('active');
    
    if(tabId === 'tab-kids') renderClassTable();
    if(tabId === 'tab-week') loadChildData();
};

document.appsferaSubTab = function(subTabId, btnElement) {
    var subTabs = document.querySelectorAll('.school-app .sub-tab-content');
    subTabs.forEach(function(tab) { tab.style.setProperty('display', 'none', 'important'); tab.classList.remove('active'); });
    var buttons = document.querySelectorAll('.school-app .sub-nav .sub-btn');
    buttons.forEach(function(btn) { btn.classList.remove('active'); });
    var targetSubTab = document.getElementById(subTabId);
    if (targetSubTab) { targetSubTab.style.setProperty('display', 'block', 'important'); targetSubTab.classList.add('active'); }
    btnElement.classList.add('active');
};

function initApp() {
    var todayStr = new Date().toISOString().split('T')[0];
    var dateInput1 = document.getElementById("week-date");
    var dateInput2 = document.getElementById("table-filter-date");
    if(dateInput1) dateInput1.value = todayStr;
    if(dateInput2) dateInput2.value = todayStr;

    renderAllDirectories();
    renderDaysForm();
    renderClassTable();
    renderSchedule();
    loadChildData();
}

function createEmptyWeek() {
    var week = {};
    appData.days.forEach(function(day) { week[day] = { meal: "Не указано", leave: "Не указано", parent: "Не указано" }; });
    week.comment = "";
    return week;
}

function renderAllDirectories() {
    var select = document.getElementById("week-child-select");
    if (select) {
        var currentChild = select.value; select.innerHTML = "";
        appData.children.forEach(function(child) {
            var opt = document.createElement("option"); opt.value = child; opt.textContent = child; select.appendChild(opt);
        });
        if (appData.children.indexOf(currentChild) !== -1) select.value = currentChild;
    }

    function fillEditableDirList(elementId, arrayData, saveFnName, deleteFnName, blockFirstItem) {
        var listEl = document.getElementById(elementId); if (!listEl) return;
        listEl.innerHTML = "";
        arrayData.forEach(function(item, index) {
            var div = document.createElement("div"); div.className = "dir-item";
            var isBlocked = blockFirstItem && index === 0;
            var inputHtml = '<input type="text" value="' + item + '" id="' + elementId + '-inp-' + index + '" ' + (isBlocked ? 'disabled' : '') + ' style="padding: 6px; font-size:0.85rem;">';
            var actionsHtml = '<div style="display:flex; gap:4px;">' +
                (isBlocked ? '' : '<button class="btn" style="padding:4px 8px; font-size:0.8rem; background:#04d361;" onclick="' + saveFnName + '(' + index + ')">💾</button>') +
                (isBlocked ? '' : '<button class="btn btn-delete" onclick="' + deleteFnName + '(' + index + ')">✕</button>') +
                '</div>';
            div.innerHTML = inputHtml + actionsHtml;
            listEl.appendChild(div);
        });
    }

    fillEditableDirList("directory-children-list", appData.children, "editChild", "deleteChild", false);
    fillEditableDirList("directory-lessons-list", appData.lessonsList, "editLesson", "deleteLesson", true);
    fillEditableDirList("directory-time-list", appData.timeList, "editTime", "deleteTime", false);
    fillEditableDirList("directory-meals-list", appData.mealsOptions, "editMeal", "deleteMeal", true);
    fillEditableDirList("directory-leave-list", appData.leaveOptions, "editLeave", "deleteLeave", true);
    fillEditableDirList("directory-parents-list", appData.parentsOptions, "editParent", "deleteParent", true);
}

function renderDaysForm() {
    var container = document.getElementById("days-container"); if (!container) return;
    container.innerHTML = "";
    appData.days.forEach(function(day) {
        var card = document.createElement("div"); card.className = "day-card";
        var title = document.createElement("div"); title.className = "day-title"; title.textContent = day; card.appendChild(title);
        
        var lblMeal = document.createElement("label"); lblMeal.textContent = "Обед *"; card.appendChild(lblMeal);
        var selMeal = document.createElement("select"); selMeal.id = "meal-" + day;
        appData.mealsOptions.forEach(function(opt) { var o = document.createElement("option"); o.value = opt; o.textContent = opt; selMeal.appendChild(o); });
        card.appendChild(selMeal);
        
        var lblLeave = document.createElement("label"); lblLeave.textContent = "Когда заберут *"; card.appendChild(lblLeave);
        var selLeave = document.createElement("select"); selLeave.id = "leave-" + day;
        appData.leaveOptions.forEach(function(opt) { var o = document.createElement("option"); o.value = opt; o.textContent = opt; selLeave.appendChild(o); });
        card.appendChild(selLeave);

        var lblParent = document.createElement("label"); lblParent.textContent = "Кто заберёт"; card.appendChild(lblParent);
        var selParent = document.createElement("select"); selParent.id = "parent-" + day;
        appData.parentsOptions.forEach(function(opt) { var o = document.createElement("option"); o.value = opt; o.textContent = opt; selParent.appendChild(o); });
        card.appendChild(selParent);

        container.appendChild(card);
    });
}

window.changeWeekDate = function(daysOffset) {
    var input = document.getElementById("week-date"); if(!input) return;
    var d = new Date(input.value); d.setDate(d.getDate() + daysOffset); input.value = d.toISOString().split('T')[0];
    loadChildData();
};

function loadChildData() {
    var select = document.getElementById("week-child-select"); if (!select || !select.value) return;
    var child = select.value;
    var dateVal = document.getElementById("week-date").value;
    var weekKey = getWeekKey(dateVal);

    var parentRangeLabel = document.getElementById("week-range-text-parent");
    if(parentRangeLabel) parentRangeLabel.textContent = getWeekRangeDisplay(dateVal);

    if(!appData.records[weekKey]) appData.records[weekKey] = {};
    if(!appData.records[weekKey][child]) appData.records[weekKey][child] = createEmptyWeek();
    
    var record = appData.records[weekKey][child];
    var filledMeals = 0; var filledLeave = 0;

    appData.days.forEach(function(day) {
        var mealVal = record[day].meal; var leaveVal = record[day].leave; var parentVal = record[day].parent || "Не указано";
        var mEl = document.getElementById("meal-" + day); var lEl = document.getElementById("leave-" + day); var pEl = document.getElementById("parent-" + day);
        if(mEl) mEl.value = appData.mealsOptions.indexOf(mealVal) !== -1 ? mealVal : "Не указано"; 
        if(lEl) lEl.value = appData.leaveOptions.indexOf(leaveVal) !== -1 ? leaveVal : "Не указано";
        if(pEl) pEl.value = appData.parentsOptions.indexOf(parentVal) !== -1 ? parentVal : "Не указано";
        if (mealVal !== "Не указано") filledMeals++; if (leaveVal !== "Не указано") filledLeave++;
    });
    
    var commEl = document.getElementById("week-comment"); if (commEl) commEl.value = record.comment || "";
    document.getElementById("stat-meals").textContent = filledMeals + " из 5";
    document.getElementById("stat-leave").textContent = filledLeave + " из 5";
}

window.saveWeekData = function() {
    var child = document.getElementById("week-child-select").value; if (!child) return;
    var dateVal = document.getElementById("week-date").value;
var weekKey = getWeekKey(dateVal);var hasError = false;var errorDay = "";appData.days.forEach(function(day) {var mealVal = document.getElementById("meal-" + day).value;var leaveVal = document.getElementById("leave-" + day).value;if (mealVal === "Не указано" || leaveVal === "Не указано") { hasError = true; errorDay = day; }});if (hasError) {alert("Ошибка сохранения! Заполните поля 'Обед' и 'Когда заберут' для дня: " + errorDay);return;}if(!appData.records[weekKey]) appData.records[weekKey] = {};if(!appData.records[weekKey][child]) appData.records[weekKey][child] = createEmptyWeek();appData.days.forEach(function(day) {appData.records[weekKey][child][day].meal = document.getElementById("meal-" + day).value;appData.records[weekKey][child][day].leave = document.getElementById("leave-" + day).value;appData.records[weekKey][child][day].parent = document.getElementById("parent-" + day).value;});appData.records[weekKey][child].comment = document.getElementById("week-comment").value;loadChildData(); alert("Данные сохранены на выбранную неделю!");};window.duplicateToNextWeek = function() {var child = document.getElementById("week-child-select").value; if (!child) return;var currentDateVal = document.getElementById("week-date").value;var currentWeekKey = getWeekKey(currentDateVal);var hasError = false;appData.days.forEach(function(day) {if(document.getElementById("meal-" + day).value === "Не указано" || document.getElementById("leave-" + day).value === "Не указано") hasError = true;});if(hasError) return alert("Невозможно скопировать! Сначала заполните текущую неделю полностью без пропусков.");appData.days.forEach(function(day) {if(!appData.records[currentWeekKey]) appData.records[currentWeekKey] = {};if(!appData.records[currentWeekKey][child]) appData.records[currentWeekKey][child] = createEmptyWeek();appData.records[currentWeekKey][child][day].meal = document.getElementById("meal-" + day).value;appData.records[currentWeekKey][child][day].leave = document.getElementById("leave-" + day).value;appData.records[currentWeekKey][child][day].parent = document.getElementById("parent-" + day).value;});appData.records[currentWeekKey][child].comment = document.getElementById("week-comment").value;var nextDate = new Date(currentDateVal); nextDate.setDate(nextDate.getDate() + 7);var nextWeekKey = getWeekKey(nextDate.toISOString().split('T')[0]);if(!appData.records[nextWeekKey]) appData.records[nextWeekKey] = {};appData.records[nextWeekKey][child] = JSON.parse(JSON.stringify(appData.records[currentWeekKey][child]));alert("План продублирован на следующую неделю!");};window.changeFilterWeek = function(daysOffset) {var input = document.getElementById("table-filter-date"); if(!input) return;var d = new Date(input.value); d.setDate(d.getDate() + daysOffset); input.value = d.toISOString().split('T')[0];renderClassTable();};function renderClassTable() {var tbody = document.getElementById("class-table-body"); if (!tbody) return;tbody.innerHTML = "";var filterDateVal = document.getElementById("table-filter-date").value;var weekKey = getWeekKey(filterDateVal);var labelRange = document.getElementById("week-range-text"); if(labelRange) labelRange.textContent = getWeekRangeDisplay(filterDateVal);var totalKids = appData.children.length; var filledPlansCount = 0; var totalComplexCount = 0;var currentWeekRecords = appData.records[weekKey] || {};appData.children.forEach(function(child) {var row = document.createElement("tr"); var nameTd = document.createElement("td");var parts = child.split(" ");var shortName = parts[0] + " " + (parts[1] ? parts[1].charAt(0) + "." : "") + " " + (parts[2] ? parts[2].charAt(0) + "." : "");nameTd.innerHTML = "" + shortName.trim() + "";row.appendChild(nameTd);var record = currentWeekRecords[child] || createEmptyWeek(); var hasData = false;appData.days.forEach(function(day) {var td = document.createElement("td"); var item = record[day];var meal = item.meal === "Не указано" ? "?" : item.meal;var leave = item.leave === "Не указано" ? "?" : item.leave.replace("После уроков ", "").replace("В кружок ", "");var parent = (item.parent === "Не указано" || !item.parent) ? "" : " (" + item.parent + ")";if(meal.toLowerCase() === "комплекс") { totalComplexCount++; }td.textContent = meal + " / " + leave + parent;if(meal !== "?" || leave !== "?") hasData = true; row.appendChild(td);});var commentTd = document.createElement("td");commentTd.style.color = "#8d8d99"; commentTd.style.fontStyle = "italic";commentTd.textContent = record.comment ? record.comment : "—";row.appendChild(commentTd);if(hasData) filledPlansCount++; tbody.appendChild(row);});document.getElementById("total-kids-count").textContent = totalKids;document.getElementById("filled-kids-count").textContent = filledPlansCount;document.getElementById("total-complex-count").textContent = totalComplexCount;}function renderSchedule() {var container = document.getElementById("schedule-container"); if (!container) return;container.innerHTML = "";while(appData.schedule.length < appData.timeList.length) {appData.schedule.push({ mon: "Нет урока", tue: "Нет урока", wed: "Нет урока", thu: "Нет урока", fri: "Нет урока" });}appData.timeList.forEach(function(timeName, lIndex) {var card = document.createElement("div"); card.className = "day-card";var title = document.createElement("div"); title.className = "day-title"; title.textContent = timeName; card.appendChild(title);var daysKeys = [{k:"mon", n:"ПН"}, {k:"tue", n:"ВТ"}, {k:"wed", n:"СР"}, {k:"thu", n:"ЧТ"}, {k:"fri", n:"ПТ"}];daysKeys.forEach(function(dayObj) {var lbl = document.createElement("label"); lbl.textContent = dayObj.n; card.appendChild(lbl);var sel = document.createElement("select"); sel.id = "sched-" + lIndex + "-" + dayObj.k;appData.lessonsList.forEach(function(lesName) {var o = document.createElement("option"); o.value = lesName; o.textContent = lesName; sel.appendChild(o);});sel.value = appData.schedule[lIndex][dayObj.k] || "Нет урока"; card.appendChild(sel);});container.appendChild(card);});}window.saveScheduleData = function() {var daysKeys = ["mon", "tue", "wed", "thu", "fri"];appData.schedule.forEach(function(lesson, lIndex) {if(lIndex >= appData.timeList.length) return;daysKeys.forEach(function(key) {var el = document.getElementById("sched-" + lIndex + "-" + key); if (el) appData.schedule[lIndex][key] = el.value;});});alert("Расписание обновлено!");};window.editChild = function(index) {var oldVal = appData.children[index];var newVal = document.getElementById("directory-children-list-inp-" + index).value.trim();if(!newVal || oldVal === newVal) return;appData.children[index] = newVal;Object.keys(appData.records).forEach(function(wKey) {if(appData.records[wKey][oldVal]) { appData.records[wKey][newVal] = appData.records[wKey][oldVal]; delete appData.records[wKey][oldVal]; }});renderAllDirectories(); renderClassTable(); alert("ФИО ученика успешно изменено!");};window.editLesson = function(index) {var oldVal = appData.lessonsList[index];var newVal = document.getElementById("directory-lessons-list-inp-" + index).value.trim();if(!newVal || oldVal === newVal) return;appData.lessonsList[index] = newVal;appData.schedule.forEach(function(l) { ["mon","tue","wed","thu","fri"].forEach(function(k) { if(l[k] === oldVal) l[k] = newVal; }); });renderAllDirectories(); renderSchedule(); alert("Название предмета изменено!");};window.editTime = function(index) {var newVal = document.getElementById("directory-time-list-inp-" + index).value.trim();if(!newVal) return; appData.timeList[index] = newVal;renderAllDirectories(); renderSchedule(); alert("Время звонков обновлено!");};window.editMeal = function(index) {var oldVal = appData.mealsOptions[index];var newVal = document.getElementById("directory-meals-list-inp-" + index).value.trim();if(!newVal || oldVal === newVal) return;appData.mealsOptions[index] = newVal; updateParentRecords(oldVal, newVal, "meal");renderAllDirectories(); renderDaysForm(); loadChildData(); renderClassTable(); alert("Тип обеда изменен!");};window.editLeave = function(index) {var oldVal = appData.leaveOptions[index];var newVal = document.getElementById("directory-leave-list-inp-" + index).value.trim();if(!newVal || oldVal === newVal) return;appData.leaveOptions[index] = newVal; updateParentRecords(oldVal, newVal, "leave");renderAllDirectories(); renderDaysForm(); loadChildData(); renderClassTable(); alert("Статус ухода изменен!");};window.editParent = function(index) {var oldVal = appData.parentsOptions[index];var newVal = document.getElementById("directory-parents-list-inp-" + index).value.trim();if(!newVal || oldVal === newVal) return;appData.parentsOptions[index] = newVal; updateParentRecords(oldVal, newVal, "parent");renderAllDirectories(); renderDaysForm(); loadChildData(); renderClassTable(); alert("Сопровождающий изменен!");};function updateParentRecords(oldV, newV, fieldKey) {Object.keys(appData.records).forEach(function(wKey) {Object.keys(appData.records[wKey]).forEach(function(child) {appData.days.forEach(function(d) {if(appData.records[wKey][child][d] && appData.records[wKey][child][d][fieldKey] === oldV) appData.records[wKey][child][d][fieldKey] = newV;});});});}window.addNewChild = function() {var inp = document.getElementById("new-child-name"); var val = inp.value.trim();if (!val) return; if (appData.children.indexOf(val) === -1) { appData.children.push(val); inp.value = ""; renderAllDirectories(); renderClassTable(); }};window.deleteChild = function(index) {var child = appData.children[index]; if (confirm("Удалить " + child + "?")) {appData.children.splice(index, 1);Object.keys(appData.records).forEach(function(wKey) { delete appData.records[wKey][child]; });renderAllDirectories(); renderClassTable(); loadChildData();}};window.addNewLesson = function() {var inp = document.getElementById("new-lesson-name"); var val = inp.value.trim();if (!val) return; if (appData.lessonsList.indexOf(val) === -1) { appData.lessonsList.push(val); inp.value = ""; renderAllDirectories(); renderSchedule(); }};window.deleteLesson = function(index) {if(index === 0) return alert("Нельзя удалить");appData.lessonsList.splice(index, 1); renderAllDirectories(); renderSchedule();};window.addNewTime = function() {var inp = document.getElementById("new-time-name"); var val = inp.value.trim();if (!val) return; if (appData.timeList.indexOf(val) === -1) { appData.timeList.push(val); inp.value = ""; renderAllDirectories(); renderSchedule(); }};window.deleteTime = function(index) {appData.timeList.splice(index, 1); if(appData.schedule.length > appData.timeList.length) appData.schedule.splice(index, 1);renderAllDirectories(); renderSchedule();};window.addNewMeal = function() {var inp = document.getElementById("new-meal-name"); var val = inp.value.trim();if (!val) return; if (appData.mealsOptions.indexOf(val) === -1) { appData.mealsOptions.push(val); inp.value = ""; renderAllDirectories(); renderDaysForm(); loadChildData(); }};window.deleteMeal = function(index) {if(index === 0) return alert("Нельзя удалить");appData.mealsOptions.splice(index, 1); renderAllDirectories(); renderDaysForm(); loadChildData();};window.addNewLeave = function() {var inp = document.getElementById("new-leave-name"); var val = inp.value.trim();if (!val) return; if (appData.leaveOptions.indexOf(val) === -1) { appData.leaveOptions.push(val); inp.value = ""; renderAllDirectories(); renderDaysForm(); loadChildData(); }};window.deleteLeave = function(index) {if(index === 0) return alert("Нельзя удалить");appData.leaveOptions.splice(index, 1); renderAllDirectories(); renderDaysForm(); loadChildData();};window.addNewParent = function() {var inp = document.getElementById("new-parent-name"); var val = inp.value.trim();if (!val) return; if (appData.parentsOptions.indexOf(val) === -1) { appData.parentsOptions.push(val); inp.value = ""; renderAllDirectories(); renderDaysForm(); loadChildData(); }};window.deleteParent = function(index) {if(index === 0) return alert("Нельзя удалить");appData.parentsOptions.splice(index, 1); renderAllDirectories(); renderDaysForm(); loadChildData();};setTimeout(initApp, 100);
