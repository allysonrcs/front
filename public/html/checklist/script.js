function toggleAllSubChecks(groupId, mainCheck) {
    let subChecks = document.querySelectorAll(`#${groupId} .sub-check`);
    subChecks.forEach((check) => (check.checked = mainCheck.checked));
}

function updateMainCheck(groupId, mainCheckId) {
    let subChecks = document.querySelectorAll(`#${groupId} .sub-check`);
    let mainCheck = document.getElementById(mainCheckId);

    let allChecked = Array.from(subChecks).every((check) => check.checked);
    mainCheck.checked = allChecked;
}

function toggleRules(id) {
    var rules = document.getElementById(id);

    if (rules.classList.contains("show")) {
        rules.classList.remove("show");
    } else {
        rules.classList.add("show");
    }
}

document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll("input[type='checkbox']").forEach((checkbox) => {
        checkbox.addEventListener("click", (event) => {
            event.stopPropagation();
        });
    });
});

function toggleSubRules(id) {
    var subRules = document.getElementById(id);
    if (subRules) {
        subRules.classList.toggle("show");
    }
}

const revisionDate = "18/02/2025";
document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll(".revision-date").forEach((el) => {
        el.textContent = "Última Revisão: " + revisionDate;
    });
});
