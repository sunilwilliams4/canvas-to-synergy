
console.log("starting canvas to synergy")



var url
getURL().then((foundUrl) => {
    console.log(foundUrl)
    url = foundUrl
    url = "lms.pps.net"

    if (url.indexOf("lms.pps.net") == -1) window.setTimeout(() => {
        document.getElementById("refreshAllGrades").style.display = "none"
        document.getElementById("refreshAllGrades").title = "Grades can only be refreshed when in lms.pps.net"
        for (let i = 0; i < courses.length; i++) {
            courses[i].downloadButton.disabled = true
            courses[i].downloadButton.classList.remove("downloadHover")
            courses[i].downloadButton.style.cursor = "not-allowed"
            courses[i].downloadButton.title = "Grades can only be refreshed when in lms.pps.net"
        }
    }, 1000)
})
async function getURL() {
    var tabs = await chrome.tabs.query(chrome.tabs.query({active: true, lastFocusedWindow: true}))
    for (let i = 0; i < tabs.length; i++) if (tabs[i].selected) return tabs[i].url
}



var yearStartDate = new Date(2022, 7, 30)
var firstQuarterDate = new Date(2022, 10, 3)
var secondQuarterDate = new Date(2023, 0, 26)
var thirdQuarterDate = new Date(2023, 3, 7)
var fourthQuarterDate = new Date(2023, 5, 13)

var termStartDate = yearStartDate
var termEndDate = firstQuarterDate

const termSelector = document.getElementById("gradingPeriodSelector")
function setTermDates() {
    if (termSelector.value == 1) {
        termStartDate = yearStartDate
        termEndDate = firstQuarterDate
    }
    if (termSelector.value == 2) {
        termStartDate = yearStartDate
        termEndDate = secondQuarterDate
    }
    if (termSelector.value == 3) {
        termStartDate = secondQuarterDate
        termEndDate = thirdQuarterDate
    }
    if (termSelector.value == 4) {
        termStartDate = secondQuarterDate
        termEndDate = fourthQuarterDate
    }
}
setTermDates()
termSelector.onchange = setTermDates


// SEND STUFF //



function sendMessage(message) {

    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, message, function(response) {
            manageResponse(response)
        })
    })
}



// RECIEVE STUFF //



chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {

    //console.log(request)


    if (request.message == "doneWithSections") {
        courses[request.courseIndex].loadSections(request.sections)

        sendResponse({confirmation: "thanks, I got it!"})
    }

    
    if (request.message == "doneWithAssignments") {
        courses[request.courseIndex].loadAssignments(request.assignments)

        sendResponse({confirmation: "thanks, I got it!"})
    }

    
    if (request.message == "doneWithGrades") {
        courses[request.courseIndex].loadGrades(request.grades)
        console.log(courses[request.courseIndex])

        sendResponse({confirmation: "thanks, I got it!"})
    }

    
    if (request.message == "doneWithGroups") {
        courses[request.courseIndex].loadGroups(request.assignmentGroups)

        sendResponse({confirmation: "thanks, I got it!"})
    }

})



function manageResponse(response) {
    console.log(response)
    if (response.response == "grades") {
        console.log(response.gradesJSON)
    }

    if (response.response == "courseName") {
        currentTabCourseName = response.courseName
        document.getElementById("addCurrentTabCourse").innerHTML = "&plus; Add " + currentTabCourseName
    }

    if (response.response == "courses") {
        console.log(response.courses)
        manageCourses.populateCourses(response.courses)
    }
}



// UI //

var accessToken

const accessTokenInput = document.getElementById("accessTokenInput")
accessTokenInput.onchange = () => {
    accessToken = accessTokenInput.value
    if (accessToken.slice(0, 1) != "*") {
        accessToken = accessTokenInput.value

        chrome.storage.local.set({accessToken: accessToken}, () => {
            console.log("access token saved")
        })
    
        if (url.indexOf("lms.pps.net") != -1) {
            sendMessage({greeting: "hello from extension", request: "getCourses", accessToken: accessToken})
            manageCourses.initialize()
            manageCoursesInfo.textContent = "Loading your courses..."
    
        }
    }
}

var types = []
document.getElementById("massImportFileSelector").onchange = (event) => {
    let fileReader = new FileReader()
    fileReader.readAsBinaryString(event.target.files[0])
    fileReader.onload = () => {
        let massImport = XLSX.read(fileReader.result, {type: "binary"})
        let typeSheet = massImport.Sheets["Instructions"]
        console.log(typeSheet)

        types = []
        for (let row in typeSheet) if (row.indexOf("B") != -1) types.push(typeSheet[row].h)
        types.splice(0, 3)

        chrome.storage.local.set({types: JSON.stringify(types)}, () => {
            console.log("types saved")
        })
    }
}


const massImportDropZone = document.getElementById("massImportDropZone")
massImportDropZone.ondrop = (event) => {
    event.preventDefault()

	if (event.dataTransfer.items) {
		[...event.dataTransfer.items].forEach((item) => {
			if (item.kind === "file") {
				let fileReader = new FileReader()
                fileReader.readAsBinaryString(item.getAsFile())
                fileReader.onload = () => {
                    let massImport = XLSX.read(fileReader.result, {type: "binary"})
                    let typeSheet = massImport.Sheets["Instructions"]
                    types = []
                    for (let row in typeSheet) if (row.indexOf("B") != -1) types.push(typeSheet[row].h)
                    types.splice(0, 3)

                    chrome.storage.local.set({types: JSON.stringify(types)}, () => {
                        console.log("types saved")
                    })
                    console.log(types)
                }
				
			}
		})
	}
}


massImportDropZone.ondragover = (event) => {
	massImportDropZone.style.backgroundColor = "lightgreen"

	event.preventDefault()
}

massImportDropZone.ondragleave = () => {
	massImportDropZone.style.backgroundColor = "rgb(220, 220, 220)"
}

massImportDropZone.onmouseleave = () => {
	massImportDropZone.style.backgroundColor = "rgb(220, 220, 220)"
}


class Loading {
    constructor(parent) {
        this.image = document.createElement("img")
        this.image.src = "images/logo128.png"
        this.image.classList.add("loadingImage")
        this.image.style.width = "20px"
        this.image.style.height = "20px"
        parent.appendChild(this.image)

    }

    startLoading() {
        this.image.src = "images/logo128.png"
        this.angle = 0
        this.interval = setInterval(this.refresh, 20, this)
    }

    refresh(object) {
        object.angle += .05
        object.image.style.transform = "rotate(" + object.angle + "rad)"
    }

    endAnimation(object) {
        clearInterval(object.interval)
        object.image.style.transform = "rotate(0)"
        object.image.src = "images/checkmark.png"
    }
}

const mainContainer = document.getElementById("mainContainer")

const coursesSpan = document.getElementById("courses")
var courses = []

class Course {
    constructor(courseInfo) {
        this.id = courseInfo.id
        this.name = courseInfo.name
        this.index = courseInfo.index
        this.sections = courseInfo.sections
        this.assignments = courseInfo.assignments
        this.grades = courseInfo.grades
        this.assignmentGroups = courseInfo.assignmentGroups
        this.typeSelections = courseInfo.typeSelections
        this.lastRefreshDate = courseInfo.lastRefreshDate
        if (this.sections == null) this.sections = []
        if (this.assignments == null) this.assignments = []
        if (this.grades == null) this.grades = []
        if (this.assignmentGroups == null) this.assignmentGroups = []
        if (this.typeSelections == null) this.typeSelections = []
        if (this.lastRefreshDate == null) this.lastRefreshDate = null

        // make html elements
        this.wrapper = document.createElement("div")
        this.wrapper.classList.add("courseWrapper")
        coursesSpan.appendChild(this.wrapper)

        this.wrapper.onmouseover = () => {
            this.wrapper.style.backgroundColor = "lightgreen"
        }

        this.wrapper.onmouseleave = () => {
            this.wrapper.style.backgroundColor = "white"
        }

        this.wrapper.onclick = (event) => {
            if (event.path[0] != this.collapseButton) this.expand()
        }

        this.courseName = document.createElement("div")
        this.courseName.classList.add("courseName")
        this.courseName.textContent = this.name
        this.wrapper.appendChild(this.courseName)

        this.idNote = document.createElement("span")
        this.idNote.classList.add("note")
        this.idNote.textContent = this.id
        this.courseName.appendChild(this.idNote)

        this.collapseButton = document.createElement("button")
        this.collapseButton.classList.add("collapse")
        this.collapseButton.textContent = "Collapse Course"
        this.wrapper.appendChild(this.collapseButton)

        this.collapseButton.onclick = () => {
            this.collapse()
        }

        this.downloadButton = document.createElement("button")
        this.downloadButton.classList.add("download", "downloadHover")
        this.downloadButton.textContent = "Refresh Course Grades"
        this.wrapper.appendChild(this.downloadButton)

        this.downloadButton.onclick = () => {
            this.downloadData()
        }

        this.sectionsProgress = document.createElement("div")
        this.sectionsProgress.classList.add("progress")
        this.sectionsProgress.textContent = "Sections and Students"
        this.wrapper.appendChild(this.sectionsProgress)

        this.sectionsLoading = new Loading(this.sectionsProgress)
        
        this.assignmentsProgress = document.createElement("div")
        this.assignmentsProgress.classList.add("progress")
        this.assignmentsProgress.textContent = "Assignment Info"
        this.wrapper.appendChild(this.assignmentsProgress)

        this.assignmentsLoading = new Loading(this.assignmentsProgress)

        this.gradesProgress = document.createElement("div")
        this.gradesProgress.classList.add("progress")
        this.gradesProgress.textContent = "Grades"
        this.wrapper.appendChild(this.gradesProgress)

        this.gradesLoading = new Loading(this.gradesProgress)

        this.groupsProgress = document.createElement("div")
        this.groupsProgress.classList.add("progress")
        this.groupsProgress.textContent = "Assignment Groups"
        this.wrapper.appendChild(this.groupsProgress)

        this.groupsLoading = new Loading(this.groupsProgress)

        this.groupToType = document.createElement("div")
        this.groupToType.classList.add("groupToType")
        this.wrapper.appendChild(this.groupToType)

        this.typeMatchers = []
        this.groupLabels = []
        this.typeDropdownWrappers = []
        this.typeDropdowns = []
        this.typeDropdownOptions = []

        this.lastRefreshLabel
        this.downloadFileButtons = []

        this.convertedGrades

        this.makeTypeMatchers()


        this.updateState()


    }


    downloadData() {

        this.sections = []
        this.assignments = []
        this.grades = []
        this.assignmentGroups = []

        this.sectionsLoading.startLoading()
        this.assignmentsLoading.startLoading()
        this.gradesLoading.startLoading()
        this.groupsLoading.startLoading()

        this.updateState()

        sendMessage({greeting: "hello from extension", request: "getGrades", courseId: this.id, courseIndex: this.index, accessToken: accessToken})
    }

    loadSections(sections) {
        this.sections = sections
        this.setLastRefreshDate()
        this.updateState()
        saveCourses()
    }

    loadAssignments(assignments) {
        let optimizedAssignments = []
        for (let i = 0; i < assignments.length; i++) {
            optimizedAssignments.push({
                assignment_group_id: assignments[i].assignment_group_id,
                created_at: assignments[i].created_at,
                due_at: assignments[i].due_at,
                name: assignments[i].name,
                html_url: assignments[i].html_url,
                points_possible: assignments[i].points_possible,
                graded_submissions_exist: assignments[i].graded_submissions_exist
            })
        }
        this.assignments = optimizedAssignments
        this.setLastRefreshDate()
        this.updateState()
        saveCourses()
        this.setAssignmentGroupTitles()
    }

    loadGrades(grades) {
        let optimizedGrades = []
        for (let i = 0; i < grades.length; i++) {
            optimizedGrades.push([])
            for (let j = 0; j < grades[i].length; j++) {
                optimizedGrades[i].push({
                    user_id: grades[i][j].user_id,
                    score: grades[i][j].score,
                    excused: grades[i][j].excused
                })
            }
        }
        this.grades = optimizedGrades
        this.setLastRefreshDate()
        this.updateState()
        saveCourses()
    }

    loadGroups(assignmentGroups) {
        this.assignmentGroups = assignmentGroups
        this.setLastRefreshDate()
        this.updateState()
        this.makeTypeMatchers()

        saveCourses()
    }

    convertGrades() {
        // if any data is missing, return
        if (this.sections == null || this.sections == [] || this.assignments == null || this.assignments == [] || this.grades == null || this.grades == [] || this.assignmentGroups == null || this.assignmentGroups == []) return

        // turn imported data into a JSON
        let exportJSON = {}
        for (let i = 0; i < this.sections.length; i++) {
            let currentSection = this.sections[i].name
            exportJSON[currentSection] = []
            for (let j = 0; j < this.sections[i].students.length; j++) {
                let currentStudent = this.sections[i].students[j]
                for (let k = 0; k < this.grades.length; k++) {
                    if (this.assignments[k].graded_submissions_exist) {
                        
                        let currentAssignmentType
                        for (let l = 0; l < this.typeSelections.length; l++) if (this.assignments[k].assignment_group_id == this.assignmentGroups[l].id) currentAssignmentType = this.typeSelections[l]
                        let submissionFound = false
                        let currentScore = null
                        let currentExcused = false
                        for (let l = 0; l < this.grades[k].length; l++) {
                            if (this.grades[k][l].user_id == currentStudent.id) {
                                submissionFound = true
                                currentScore = this.grades[k][l].score
                                currentExcused = this.grades[k][l].excused
                            }
                        }
                        if (currentExcused == true) currentExcused = "True"
                        else currentExcused = "False"
                        let assignmentDate = new Date(this.assignments[k].created_at)
                        let dueDate = new Date(this.assignments[k].due_at)

                        if (this.assignments[k].created_at == null) assignmentDate = termEndDate
                        else if (assignmentDate.getTime() < termStartDate.getTime()) assignmentDate = termStartDate
                        else if (assignmentDate.getTime() > termEndDate.getTime()) assignmentDate = termEndDate

                        if (this.assignments[k].due_at == null) dueDate = termEndDate
                        else if (dueDate.getTime() < termStartDate.getTime()) dueDate = termStartDate
                        else if (dueDate.getTime() > termEndDate.getTime()) dueDate = termEndDate

                        // add object to exportJSON containing grade on current assignment for current student
                        if (submissionFound) exportJSON[currentSection].push({
                            "STUDENT_PERM_ID": currentStudent.sis_user_id,
                            "STUDENT_LAST_NAME": currentStudent.sortable_name.slice(0, currentStudent.sortable_name.indexOf(", ")),
                            "STUDENT_FIRST_NAME": currentStudent.sortable_name.slice(currentStudent.sortable_name.indexOf(", ") + 2),
                            "OVERALL_SCORE": currentScore,
                            "ASSIGNMENT_NAME": this.assignments[k].name,
                            "ASSIGNMENT_DESCRIPTION": "Canvas URL: " + this.assignments[k].html_url,
                            "MAX_SCORE": this.assignments[k].points_possible,
                            "POINTS": currentScore,
                            "ASSIGNMENT_DATE": assignmentDate.toLocaleDateString(),
                            "DUE_DATE": dueDate.toLocaleDateString(),
                            "SCORE_TYPE": "Raw Score",
                            "ASSIGNMENT_TYPE": currentAssignmentType,
                            "EXCUSED": currentExcused
                        })
                    }
                }
            }
        }

        this.convertedGrades = exportJSON
    }

    updateState() {
        if (this.sections != null && this.sections[0] != null) {
            this.sectionsLoading.endAnimation(this.sectionsLoading)
            this.sectionsProgress.style.backgroundColor = "lightgreen"
        }
        else this.sectionsProgress.style.backgroundColor = "rgb(230, 230, 230)"

        if (this.assignments != null && this.assignments[0] != null) {
            this.assignmentsLoading.endAnimation(this.assignmentsLoading)
            this.assignmentsProgress.style.backgroundColor = "lightgreen"
        }
        else this.assignmentsProgress.style.backgroundColor = "rgb(230, 230, 230)"

        if (this.grades != null && this.grades[0] != null) {
            this.gradesLoading.endAnimation(this.gradesLoading)
            this.gradesProgress.style.backgroundColor = "lightgreen"
        }
        else this.gradesProgress.style.backgroundColor = "rgb(230, 230, 230)"

        if (this.assignmentGroups != null && this.assignmentGroups[0] != null) {
            this.groupsLoading.endAnimation(this.groupsLoading)
            this.groupsProgress.style.backgroundColor = "lightgreen"
            this.groupToType.style.display = ""
        }
        else {
            this.groupsProgress.style.backgroundColor = "rgb(230, 230, 230)"
            this.groupToType.style.display = "none"
        }

        if (this.sections != null && this.sections[0] != null && this.assignments != null && this.assignments[0] != null && this.grades != null && this.grades[0] != null && this.assignmentGroups != null && this.assignmentGroups[0] != null) {
            this.makeTypeMatchers()
            this.lastRefreshLabel.style.display = ""
            for (let i = 0; i < this.downloadFileButtons.length; i++) {
                this.downloadFileButtons[i].style.display = ""
            }
        }
        else {
            this.lastRefreshLabel.style.display = "none"
            for (let i = 0; i < this.downloadFileButtons.length; i++) {
                this.downloadFileButtons[i].style.display = "none"
            }
        }
    }

    collapse() {
        this.wrapper.style.height = "33px"
        this.wrapper.style.overflowY = "hidden"
        this.wrapper.style.boxShadow = "0px 0px 10px 0px rgba(0, 0, 0, 0.125)"
        this.wrapper.style.marginLeft = "5px"
        this.wrapper.style.marginRight = "5px"
        this.wrapper.style.cursor = "pointer"
        this.courseName.style.fontSize = "20px"

        mainContainer.scrollTo({top: 0, left: 0, behavior: "smooth"})
        
        this.wrapper.onmouseover = () => {
            this.wrapper.style.backgroundColor = "lightgreen"
        }
    }

    expand() {
        this.wrapper.style.height = 472 + "px"
        this.wrapper.style.overflowY = "auto"
        this.wrapper.style.backgroundColor = "white"
        this.wrapper.style.boxShadow = "0px 0px 10px 0px rgba(0, 0, 0, 0.0)"
        this.wrapper.style.marginLeft = "0px"
        this.wrapper.style.marginRight = "0px"
        this.wrapper.style.cursor = "auto"
        this.courseName.style.fontSize = "30px"

        mainContainer.scrollTo({top: this.wrapper.offsetTop - 10, left: 0, behavior: "smooth"})

        this.wrapper.onmouseover = () => {
            this.wrapper.style.backgroundColor = "white"
        }
    }

    setAssignmentGroupTitles() {
        for (let i = 0; i < this.groupLabels.length; i++) {
            let currentGroupTitle = ""
            if (this.assignments != null) for (let j = 0; j < this.assignments.length; j++) if (this.assignments[j].assignment_group_id == this.assignmentGroups[i].id) currentGroupTitle += this.assignments[j].name + ", "
            if (currentGroupTitle != "") currentGroupTitle = currentGroupTitle.slice(0, -2)
            else currentGroupTitle = "Assignments in this group haven't been loaded yet or don't exist"

            this.groupLabels[i].title = currentGroupTitle

        }
        
    }

    setLastRefreshDate() {
        let date = new Date(Date.now())
        this.lastRefreshDate = "Last Refreshed: " + date.toLocaleDateString() + " at " + date.toLocaleTimeString()
        if (this.lastRefreshLabel != null) this.lastRefreshLabel.textContent = this.lastRefreshDate
    }

    makeTypeMatchers() {

        if (this.instructions != null) this.instructions.remove()
        for (let i = 0; i < this.typeMatchers.length; i++) this.typeMatchers[i].remove()
        for (let i = 0; i < this.groupLabels.length; i++) this.groupLabels[i].remove()
        for (let i = 0; i < this.typeDropdownWrappers.length; i++) this.typeDropdownWrappers[i].remove()
        for (let i = 0; i < this.typeDropdowns.length; i++) this.typeDropdowns[i].remove()
        for (let i = 0; i < this.typeDropdownOptions.length; i++) for (let j = 0; j < this.typeDropdownOptions[i].length; j++) this.typeDropdownOptions[i][j].remove()
        for (let i = 0; i < this.downloadFileButtons.length; i++) this.downloadFileButtons[i].remove()
        if (this.lastRefreshLabel != null) this.lastRefreshLabel.remove()

        this.typeMatchers = []
        this.groupLabels = []
        this.typeDropdownWrappers = []
        this.typeDropdowns = []
        this.typeDropdownOptions = []
        this.downloadFileButtons = []

        this.instructions = document.createElement("div")
        this.instructions.classList.add("instructions")
        this.instructions.innerHTML = `
            <span style = "color: white">Please match Canvas assignment groups (left) to Synergy assignment types (right)</span>
            <span style = "color: rgba(255, 255, 255, .75)">(hover over assignment groups to view assignments)</span>`
        this.groupToType.appendChild(this.instructions)


        for (let i = 0; i < this.assignmentGroups.length; i++) {
            let typeMatcher = document.createElement("div")
            typeMatcher.classList.add("typeMatcher")
            this.groupToType.appendChild(typeMatcher)
            this.typeMatchers.push(typeMatcher)

            let typeDropdownWrapper = document.createElement("div")
            typeDropdownWrapper.classList.add("typeDropdownWrapper")
            typeMatcher.appendChild(typeDropdownWrapper)
            this.typeDropdownWrappers.push(typeDropdownWrapper)

            let typeDropdown = document.createElement("select")
            typeDropdown.classList.add("typeDropdown")
            typeDropdown.title = "Select the appropriate Synergy assignment type for the assignment grop to the left"
            typeDropdownWrapper.appendChild(typeDropdown)
            this.typeDropdowns.push(typeDropdown)

            let currentDropdownOptions = []
            for (let j = 0; j < types.length; j++) {
                let typeDropdownOption = document.createElement("option")
                typeDropdownOption.value = types[j]
                typeDropdownOption.textContent = types[j]
                typeDropdown.appendChild(typeDropdownOption)
                currentDropdownOptions.push(typeDropdownOption)
            }
            this.typeDropdownOptions.push(currentDropdownOptions)

            if (this.typeSelections.length > 0) typeDropdown.value = this.typeSelections[i]
            this.typeSelections[i] = typeDropdown.value
            typeDropdown.onchange = () => {
                this.typeSelections[i] = typeDropdown.value
                saveCourses()
                this.convertGrades()
            }

            let groupLabel = document.createElement("div")
            groupLabel.classList.add("groupLabel")
            groupLabel.textContent = this.assignmentGroups[i].name
            typeMatcher.appendChild(groupLabel)
            this.groupLabels.push(groupLabel)

        }
        this.setAssignmentGroupTitles()

        this.convertGrades()

        // create label to display last time grades were refreshed
        let lastRefreshLabel = document.createElement("div")
        lastRefreshLabel.classList.add("lastRefreshLabel")
        lastRefreshLabel.textContent = this.lastRefreshDate
        this.wrapper.appendChild(lastRefreshLabel)
        this.lastRefreshLabel = lastRefreshLabel
        
        for (let i = 0; i < this.sections.length; i++) { // create a button for each canvas course section
            let downloadFileButton = document.createElement("button")
            downloadFileButton.classList.add("downloadFileButton")
            downloadFileButton.textContent = "Download " + this.sections[i].name
            downloadFileButton.title = "Download Synergy import file"
            this.wrapper.appendChild(downloadFileButton)
            this.downloadFileButtons.push(downloadFileButton)

            downloadFileButton.onclick = () => { // download synergy import file (a .xls file with grades for this section)
                console.log(this.sections[i].name)
                console.log(this.convertedGrades[this.sections[i].name])

                // make .xls file from grades of this section

                let currentGradesJSON = this.convertedGrades[this.sections[i].name]

                let tableXML = `<thead valign = "top">`
                tableXML += "<tr>"
                for (let columnName in currentGradesJSON[0]) tableXML += "<th>" + columnName + "</th>"
                tableXML += "</tr></thead><tbody>"

                for (let i = 0; i < currentGradesJSON.length; i++) {
                    tableXML += "<tr>"
                    for (let columnName in currentGradesJSON[i]) {
                        tableXML += "<td>" + currentGradesJSON[i][columnName] + "</td>"
                    }
                    tableXML += "</tr>"
                }

                tableXML += "</tbody>"

                tableXML = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40"><head><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>{worksheet}</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--><meta http-equiv="content-type" content="text/plain; charset=UTF-8"/></head><body><table>${tableXML}</table></body></html>`

                let gradesBlob = new Blob([tableXML], {type: "application/vnd.ms-excel"}) // create blob out of tableXML
                // download the file as "canvas section name.xls"
                let url = URL.createObjectURL(gradesBlob)
                let a = document.createElement("a")
                document.body.appendChild(a)
                a.href = url
                a.download = this.sections[i].name + ".xls"
                a.click()
                window.setTimeout(() => {URL.revokeObjectURL(url)}, 0)
                
            }
        }
    }

    delete() {
        for (let i = this.index + 1; i < courses.length; i++) {
            courses[i].index--
        }
        this.wrapper.innerHTML = ""
        this.wrapper.remove()
    }


}

document.getElementById("refreshAllGrades").onclick = () => {
    for (let i = 0; i < courses.length; i++) {
        courses[i].downloadData()
    }
}

const sideContainer = document.getElementById("sideContainer")
 class ListCourse {
    constructor(id, name) {
        this.id = id
        this.name = name

        this.wrapper = document.createElement("div")
        this.wrapper.classList.add("listCourse")
        this.wrapper.innerHTML = this.name + "<br>"
        sideContainer.appendChild(this.wrapper)

        this.idNote = document.createElement("span")
        this.idNote.classList.add("listCourseNote")
        this.idNote.innerHTML = this.id + "<br>"
        this.wrapper.appendChild(this.idNote)

        this.addButton = document.createElement("button")
        this.addButton.classList.add("addListCourse")
        this.wrapper.appendChild(this.addButton)

        this.alreadyAdded
        this.checkIfAlreadyAdded()
        this.addButton.onclick = () => {
            if (!this.alreadyAdded) {
                courses.push(new Course({
                    id: this.id,
                    name: this.name,
                    index: courses.length
                }))
            }
            else {
                let matchingIndex
                for (let i = 0; i < courses.length; i++) if (this.id == courses[i].id) matchingIndex = i
                if (matchingIndex != null) {
                    console.log(courses[matchingIndex])
                    courses[matchingIndex].delete()
                    courses.splice(matchingIndex, 1)
                    console.log(courses)
                }
            }
            saveCourses()
            this.checkIfAlreadyAdded()
        }


    }

    checkIfAlreadyAdded() {
        this.alreadyAdded = false
        for (let j = 0; j < courses.length; j++) if (courses[j].id == this.id) this.alreadyAdded = true
        if (!this.alreadyAdded) {
            this.addButton.innerHTML = `&plus; Add`
            this.addButton.style.backgroundColor = "green"
        }
        else {
            this.addButton.innerHTML = `<span style = "font-size: 12.5px;">&#10005;</span> Remove`
            this.addButton.style.backgroundColor = "red"
        }
    }

    delete() {
        this.wrapper.innerHTML = ""
        this.wrapper.remove()
    }
}


const manageCoursesInfo = document.createElement("div")
const manageCoursesImage = document.createElement("img")
var manageCoursesList = []
var manageCourses = {
    open: false,
    image: null,

    initialize: () => {
        for (let i = 0; i < manageCoursesList.length; i++) manageCoursesList[i].delete()
        manageCoursesImage.src = "images/logo128.png"
        sideContainer.appendChild(manageCoursesImage)

        sideContainer.appendChild(manageCoursesInfo)
        if (accessToken == null) {
            manageCoursesInfo.textContent = "Loading"
        }
        else {
            manageCoursesInfo.textContent = "Loading your courses..."
        }
    },

    setLoading(str) {
        manageCoursesInfo.textContent = str
    },

    populateCourses: (foundCourses) => {
        manageCoursesImage.remove()
        manageCoursesInfo.remove()
        console.log(foundCourses)
        for (let i = 0; i < manageCoursesList.length; i++) manageCoursesList[i].delete()
        manageCoursesList = []
        for (let i = 0; i < foundCourses.length; i++) {
            manageCoursesList.push(new ListCourse(foundCourses[i].id, foundCourses[i].name))
        }

    }
}
manageCourses.initialize()

console.log(manageCourses)

document.getElementById("manageCourses").onclick = () => {
    if (!manageCourses.open) {
        document.body.style.width = "700px"
        sideContainer.style.left = "0px"
        manageCourses.open = true
    }
    else {
        document.body.style.width = "500px"
        sideContainer.style.left = "-200px"
        manageCourses.open = false

    }
}





function saveCourses() {
    let courseInfos = []
    for (let i = 0; i < courses.length; i++) {
        courseInfos.push({
            id: courses[i].id,
            name: courses[i].name,
            index: courses[i].index,
            sections: courses[i].sections,
            assignments: courses[i].assignments,
            grades: courses[i].grades,
            assignmentGroups: courses[i].assignmentGroups,
            typeSelections: courses[i].typeSelections,
            lastRefreshDate: courses[i].lastRefreshDate
        })
    }

    chrome.storage.local.set({courseInfos: JSON.stringify(courseInfos)}, () => {
        console.log("courses saved")
    })
}



chrome.storage.local.get(["courseInfos", "accessToken", "types"], (result) => {
    if (result.types != null) {
        types = JSON.parse(result.types)
    }
    
    let courseInfos
    if (result.courseInfos != null) {
        courseInfos = JSON.parse(result.courseInfos)
    
        for (let i = 0; i < courseInfos.length; i++) {
            courses.push(new Course(courseInfos[i]))
            saveCourses()
        }
    }

    if (result.accessToken != null) {
        accessToken = result.accessToken
        let hiddenAccessToken = ""
        for (let i = 0; i < accessToken.length; i++) hiddenAccessToken += "*"
        accessTokenInput.value = hiddenAccessToken
        if (url.indexOf("lms.pps.net") != -1) sendMessage({greeting: "hello from extension", request: "getCourses", accessToken: accessToken})
        manageCourses.setLoading("Loading your courses...")
    }
})





