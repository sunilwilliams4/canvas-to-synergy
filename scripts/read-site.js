


/*
 |\__/,|   (`\
 |_ _  |.--.) )
 ( T   )     /
(((^_(((/(((_/
meow
*/

// READ CANVAS DATA //

function getPaginationLinks(header) {
    let currentStartIndex = 0
    let currentEndIndex = 0
    let links = {}
    let counter = 0
    while (currentStartIndex != -1 && currentEndIndex != -1 && counter < 50) {
        counter++
        currentStartIndex = header.indexOf("<")
        currentEndIndex = header.indexOf(">")

        let nameEndIndex = header.indexOf(",")
        if (nameEndIndex == -1) nameEndIndex = header.length

        let name = header.slice(header.indexOf("rel="), nameEndIndex)
        
        if (currentStartIndex != -1 && currentEndIndex != -1) {
            links[name] = header.slice(currentStartIndex + 1, currentEndIndex)
            header = header.slice(nameEndIndex + 1)

        }
        

    }
    return links
}


function getData(specifications, accessToken) {

    let donePaginating = false
    let maxPaginations = 100
    let paginationCounter = 0

    let returnJSON = []

    let url = "https://lms.pps.net/api/v1"
    for (let i = 0; i < specifications.length; i++) url += "/" + specifications[i]


    while (!donePaginating && paginationCounter < maxPaginations) {
        paginationCounter++

        let xhr = new XMLHttpRequest()

        xhr.open("GET", url, false)
        xhr.setRequestHeader("Authorization", "Bearer " + accessToken)
        xhr.send()

        let linkHeader = xhr.getResponseHeader("Link")
        if (linkHeader != null) {
            let links = getPaginationLinks(linkHeader)

            if (links[`rel="current"`] == links[`rel="last"`]) donePaginating = true
            url = links[`rel="next"`]
        }
        else donePaginating = true

        returnJSON = returnJSON.concat(JSON.parse(xhr.response))


    }
    return returnJSON
    
}


function getCourses(accessToken) {
    let userId = getData(["users", "self"], accessToken)[0].id
    
    let courses = getData(["users", userId, "courses"], accessToken)
    let currentDate = new Date(Date.now())
    let currentSchoolYear
    if (currentDate.getMonth() < 4) currentSchoolYear = currentDate.getFullYear()// 0 indexed
    else currentSchoolYear = currentDate.getFullYear() + 1// 0 indexed
    console.log(courses)
    var currentCourses = []
    for (let i = 0; i < courses.length; i++) {
        if (courses[i].sis_course_id != null && courses[i].sis_course_id.indexOf(currentSchoolYear) == 0) {
            currentCourses.push(courses[i])
        }
    }

    return currentCourses
}



function getGradesForCourse(courseId, courseIndex, accessToken) {
    if (accessToken == null) {
        console.log("access token not entered")
        return
    }

    getDataAsync(["courses", courseId, "sections", "?include[]=students"], accessToken).then((sections) => {
        sendMessage({message: "doneWithSections", sections: sections, courseIndex: courseIndex})
        console.log(sections)
    })

    getDataAsync(["courses", courseId, "assignments", "?include[]=all_dates"], accessToken).then((assignments) => {
        sendMessage({message: "doneWithAssignments", assignments: assignments, courseIndex: courseIndex})
        console.log(assignments)

        console.log("loading grades")
        var assignmentScores = []
        for (let i = 0; i < assignments.length; i++) {
            window.setTimeout(() => {
                getDataAsync(["courses", courseId, "assignments", assignments[i].id, "submissions"], accessToken).then((scores) => {
                    assignmentScores[i] = scores
    
                    let doneLoadingGrades = true
                    for (let j = 0; j < assignments.length; j++) if (assignmentScores[j] == null) doneLoadingGrades = false
                    if (doneLoadingGrades) {
                        sendMessage({message: "doneWithGrades", grades: assignmentScores, courseIndex: courseIndex})
                    
                        console.log(assignmentScores)
                    }
                })
            }, i * 150)
        }
        
    })

    getDataAsync(["courses", courseId, "assignment_groups"], accessToken).then((assignmentGroups) => {
        sendMessage({message: "doneWithGroups", assignmentGroups: assignmentGroups, courseIndex: courseIndex})
        console.log(assignmentGroups)
    })




}



function getStuff(url, accessToken) {

    let xhr = new XMLHttpRequest()

    xhr.open("GET", url)
    xhr.setRequestHeader("Authorization", "Bearer " + accessToken)
    xhr.send()

    return new Promise((resolve) => {
        xhr.onreadystatechange = () => {
            if (xhr.readyState == 4) resolve(xhr)
        }
    })
}



async function getDataAsync(specifications, accessToken) {

    let donePaginating = false
    let maxPaginations = 100
    let paginationCounter = 0

    let returnJSON = []

    let url = "https://lms.pps.net/api/v1"
    for (let i = 0; i < specifications.length; i++) url += "/" + specifications[i]


    while (!donePaginating && paginationCounter < maxPaginations) {
        paginationCounter++

        let xhr = await getStuff(url, accessToken)

        let linkHeader = xhr.getResponseHeader("Link")
        if (linkHeader != null) {
            let links = getPaginationLinks(linkHeader)

            if (links[`rel="current"`] == links[`rel="last"`]) donePaginating = true
            url = links[`rel="next"`]
        }
        else donePaginating = true

        returnJSON = returnJSON.concat(JSON.parse(xhr.response))


    }
    return returnJSON
    
}



// CANVAS UI //





// UI INTEGRATION //

var accessToken
var types = []


var canvasMenu = document.getElementById("menu")
var canvasWrapper = document.getElementById("wrapper")

var interfaceButton = document.createElement("button")
interfaceButton.style.width = "100%"
interfaceButton.style.height = "65px"
interfaceButton.style.backgroundColor = "transparent"
interfaceButton.style.borderStyle = "none"
interfaceButton.style.transition = "background-color .5s"
var interfaceLogo = document.createElement("img")
interfaceLogo.src = "https://i.imgur.com/XgIwQf9.png"
interfaceLogo.width = 40
interfaceButton.appendChild(interfaceLogo)
canvasMenu.appendChild(interfaceButton)

var mainWrapper = document.createElement("div")
mainWrapper.style.position = "fixed"
mainWrapper.style.top = "0px"
mainWrapper.style.left = canvasMenu.offsetWidth + "px"
mainWrapper.style.backgroundColor = "white"
mainWrapper.style.width = "calc(100% - " + canvasMenu.offsetWidth + "px)"
mainWrapper.style.height = window.innerHeight + "px"
mainWrapper.style.zIndex = "50"
mainWrapper.style.display = "none"

canvasWrapper.appendChild(mainWrapper)





canvasMenu.onclick = (event) => {
    let clickedOnInterfaceButton = false
    for (let i = 0; i < event.path.length; i++) if (event.path[i] == interfaceButton) clickedOnInterfaceButton = true
    console.log(clickedOnInterfaceButton)
    if (clickedOnInterfaceButton) {
        mainWrapper.style.display = ""
        document.getElementById("not_right_side").style.display = "none"

        let otherIcons = document.getElementsByClassName("ic-icon-svg")
        for (let i = 0; i < otherIcons.length; i++) otherIcons[i].style.fill = "#fff"
        
        let otherNames = document.getElementsByClassName("menu-item__text")
        for (let i = 0; i < otherNames.length; i++) otherNames[i].style.color = "#fff"

        let otherButtons = document.getElementsByClassName("ic-app-header__menu-list-link")
        for (let i = 0; i < otherButtons.length; i++) otherButtons[i].style.backgroundColor = "transparent"

        interfaceButton.style.backgroundColor = "#fff"
    }
    else {
        interfaceButton.style.backgroundColor = "transparent"
        for (let i = 0; i < event.path.length; i++) {
            if (event.path[i].classList != null && event.path[i].classList.contains("ic-icon-svg")) event.path[i].style.fill = "var(--ic-brand-global-nav-ic-icon-svg-fill--active)"
            if (event.path[i].classList != null && event.path[i].classList.contains("menu-item__text")) event.path[i].style.color = "var(--ic-brand-global-nav-ic-icon-svg-fill--active)"
            if (event.path[i].classList != null && event.path[i].classList.contains("ic-app-header__menu-list-link")) event.path[i].style.backgroundColor = "#fff"
        }
    }
}

document.onclick = (event) => {
    if (mainWrapper.style.display == "" && event.path.find(element => element == canvasMenu) == null) {
        let otherIcons = document.getElementsByClassName("ic-icon-svg")
        for (let i = 0; i < otherIcons.length; i++) otherIcons[i].style.fill = "#fff"
        
        let otherNames = document.getElementsByClassName("menu-item__text")
        for (let i = 0; i < otherNames.length; i++) otherNames[i].style.color = "#fff"
    
        let otherButtons = document.getElementsByClassName("ic-app-header__menu-list-link")
        for (let i = 0; i < otherButtons.length; i++) otherButtons[i].style.backgroundColor = "transparent"
    
        interfaceButton.style.backgroundColor = "#fff"

    }
    
}



let headerWrapper = document.createElement("div")
headerWrapper.classList.add("ic-app-nav-toggle-and-crumbs")
headerWrapper.style.fontSize = "1.125rem"
mainWrapper.appendChild(headerWrapper)

let options = document.createElement("button")
options.classList.add("Button", "Button--link", "ic-app-course-nav-toggle")
headerWrapper.appendChild(options)

let headerIcon = document.createElement("i")
headerIcon.classList.add("icon-hamburger")
options.appendChild(headerIcon)


let headerHomeLink = document.createElement("a")
headerHomeLink.classList.add("ellipsable")
headerHomeLink.textContent = "Canvas To Synergy "
headerHomeLink.style.cursor = "pointer"
headerWrapper.appendChild(headerHomeLink)

let headerCurrentPage = document.createElement("span")
headerCurrentPage.classList.add("ellipsable")
headerCurrentPage.textContent = ""
headerWrapper.appendChild(headerCurrentPage)





let sideBarWrapper = document.createElement("div")
sideBarWrapper.classList.add("list-view")
sideBarWrapper.style.position = "absolute"
sideBarWrapper.style.width = "192px"
sideBarWrapper.style.left = "0px"
sideBarWrapper.style.top = "105px"
sideBarWrapper.style.overflowY = "hidden"
sideBarWrapper.style.zIndex = "100"
sideBarWrapper.style.display = "block"
mainWrapper.appendChild(sideBarWrapper)

let sideBarContainer = document.createElement("div")
sideBarContainer.classList.add("ic-sticky-frame")
sideBarContainer.style.lineHeight = "1.5"
sideBarContainer.style.listStyle = "none"
sideBarWrapper.appendChild(sideBarContainer)

class SectionLink {
    static allSectionLinks = []
    constructor(name, section) {
        SectionLink.allSectionLinks.push(this)


        this.wrapper = document.createElement("li")
        this.wrapper.classList.add("section")
        sideBarContainer.appendChild(this.wrapper)

        this.link = document.createElement("a")
        this.link.classList.add("home")
        this.link.innerHTML = name + "<br><br>"
        this.link.style.padding = "7px 0px 7px 4px"
        this.link.style.marginBottom = "1px"
        this.link.style.cursor = "pointer"
        this.wrapper.appendChild(this.link)

        this.wrapper.onclick = () => {
            section.open()

            for (let i = 0; i < SectionLink.allSectionLinks.length; i++) {
                if (SectionLink.allSectionLinks[i] == this) SectionLink.allSectionLinks[i].link.classList.add("active")
                else SectionLink.allSectionLinks[i].link.classList.remove("active")
            }
        }
    }

    delete() {
        SectionLink.allSectionLinks.splice(SectionLink.allSectionLinks.indexOf(this), 1)
        this.wrapper.remove()
    }
}



class Loading {
    constructor(parent) {
        this.image = document.createElement("img")
        this.image.src = "https://i.imgur.com/XgIwQf9.png"
        this.image.classList.add("loadingImage")
        this.image.style.width = "20px"
        this.image.style.height = "20px"
        this.image.style.marginLeft = "10px"
        parent.appendChild(this.image)

    }

    startLoading() {
        this.image.src = "https://i.imgur.com/XgIwQf9.png"
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
        object.image.src = "https://i.imgur.com/CFXRbPB.png"
    }
}



class Section {
    static allSections = []
    constructor(title) {
        Section.allSections.push(this)

        this.wrapper = document.createElement("div")
        //this.wrapper.classList.add("ic-app-main-content")
        this.wrapper.style.backgroundColor = "white"
        this.wrapper.style.position = "absolute"
        this.wrapper.style.top = "75px"
        this.wrapper.style.left = "225px"
        this.wrapper.style.width = "calc(100% - 225px)"
        this.wrapper.style.height = "calc(100% - 75px)"
        this.wrapper.style.overflowY = "auto"
        this.wrapper.style.display = "none"
        mainWrapper.appendChild(this.wrapper)
        
        this.titleWrapper = document.createElement("div")
        this.titleWrapper.classList.add("title-content")
        this.wrapper.appendChild(this.titleWrapper)

        this.title = document.createElement("h1")
        this.title.classList.add("title")
        this.title.innerHTML = "<br>" + title
        this.titleWrapper.appendChild(this.title)
    }

    open() {
        for (let i = 0; i < Section.allSections.length; i++) {
            if (Section.allSections[i] == this) {
                Section.allSections[i].wrapper.style.display = ""
                headerCurrentPage.textContent = " > " + this.title.textContent
            }
            else Section.allSections[i].wrapper.style.display = "none"
        }
    }

    delete() {
        Section.allSections.splice(Section.allSections.indexOf(this), 1)
        this.wrapper.remove()
    }


}


var yearStartDate = new Date(2022, 7, 30)
var firstQuarterDate = new Date(2022, 10, 3)
var secondQuarterDate = new Date(2023, 0, 26)
var thirdQuarterDate = new Date(2023, 3, 7)
var fourthQuarterDate = new Date(2023, 5, 13)

var termStartDate = yearStartDate
var termEndDate = firstQuarterDate

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

class HomeSection extends Section {
    constructor() {
        super("Canvas To Synergy")


        this.sideBarLink = new SectionLink("Home", this)


        let accessTokenLabel = document.createElement("span")
        accessTokenLabel.innerHTML = "<br>Access Token: "
        this.wrapper.appendChild(accessTokenLabel)

        this.accessTokenInput = document.createElement("input")
        this.accessTokenInput.type = "text"
        this.accessTokenInput.name = "accessTokenInput"
        this.accessTokenInput.value = accessToken
        
        this.wrapper.appendChild(this.accessTokenInput)


        this.accessTokenSave = document.createElement("button")
        this.accessTokenSave.classList.add("Button", "Button-primary")
        this.accessTokenSave.style.marginLeft = "10px"
        this.accessTokenSave.style.color = "white"
        this.accessTokenSave.style.transition = "background-color .25s"
        this.accessTokenSave.style.backgroundColor = "var(--ic-brand-button--primary-bgd)"
        this.accessTokenSave.onmouseover = () => { this.accessTokenSave.style.backgroundColor = "var(--ic-brand-button--primary-bgd-darkened-5)" }
        this.accessTokenSave.onmouseleave = () => { this.accessTokenSave.style.backgroundColor = "var(--ic-brand-button--primary-bgd)" }
        this.accessTokenSave.style.border = "1px solid"
        this.accessTokenSave.style.borderColor = "var(--ic-brand-button--primary-bgd-darkened-15)"
        this.accessTokenSave.textContent = "Save"
        this.wrapper.appendChild(this.accessTokenSave)

        this.accessTokenSave.onclick = () => {
            accessToken = this.accessTokenInput.value
            getCoursesAsync()
            chrome.storage.local.set({accessToken: accessToken}, () => {
                console.log("access token saved")
            })
        }
        

        let sampleFileLabel = document.createElement("span")
        sampleFileLabel.innerHTML = "<br>Upload New Synergy Sample File: "
        this.wrapper.appendChild(sampleFileLabel)

        this.massImportInput = document.createElement("input")
        this.massImportInput.type = "file"
        
        this.wrapper.appendChild(this.massImportInput)
        
        this.massImportInput.onchange = (event) => {
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

        this.termSelectorLabel = document.createElement("span")
        this.termSelectorLabel.innerHTML = "<br>Select Current Grading Period: "
        this.wrapper.appendChild(this.termSelectorLabel)

        this.termSelector = document.createElement("select")
        this.termSelector.innerHTML = `
            <option value = "1">Quarter 1</option>
            <option value = "2">Quarter 2</option>
            <option value = "3">Quarter 3</option>
            <option value = "4">Quarter 4</option>`
        chrome.storage.local.get(["currentTerm"], (result) => { this.termSelector.value = result.currentTerm })
        this.wrapper.appendChild(this.termSelector)

        this.setTermDates()
        this.termSelector.onchange = () => {
            if (this.termSelector.value == 1) {
                termStartDate = yearStartDate
                termEndDate = firstQuarterDate
            }
            if (this.termSelector.value == 2) {
                termStartDate = yearStartDate
                termEndDate = secondQuarterDate
            }
            if (this.termSelector.value == 3) {
                termStartDate = secondQuarterDate
                termEndDate = thirdQuarterDate
            }
            if (this.termSelector.value == 4) {
                termStartDate = secondQuarterDate
                termEndDate = fourthQuarterDate
            }

            chrome.storage.local.set({currentTerm: this.termSelector.value}).then(() => {
                console.log("current term saved")
            })
        }
        


        this.fileLineBreak = document.createElement("br")
        this.wrapper.appendChild(this.fileLineBreak)


        // SET TERM DATES


        this.currentCourses = []

        this.addCourseLabels = []
        this.addCourseButtons = []

    }

    populateCurrentCourses(currentCourses) {

        for (let i = 0; i < this.addCourseLabels.length; i++) this.addCourseLabels[i].remove()
        for (let i = 0; i < this.addCourseButtons.length; i++) this.addCourseButtons[i].remove()

        this.currentCourses = currentCourses

        for (let i = 0; i < this.currentCourses.length; i++) {

            let alreadyAdded = false
            for (let j = 0; j < courseSections.length; j++) if (courseSections[j].id == this.currentCourses[i].id) alreadyAdded = true

            let color = "var(--ic-brand-button--primary-bgd)"
            let hoverColor = "var(--ic-brand-button--primary-bgd-darkened-5)"
            let borderColor = "var(--ic-brand-button--primary-bgd-darkened-15)"
            let text = "+ Add"
            let disabled = false

            if (alreadyAdded) {
                color = "var(--fOyUs-backgroundSuccess)"
                hoverColor = "var(--fOyUs-focusColorSuccess)"
                borderColor = "var(--fOyUs-borderColorSuccess)"
                text = "Added"
                disabled = true
            }

            let extraInfo = ""
            if (currentCourses[i].workflow_state == "available") extraInfo += ` <i style = "color: green">available</i>`
            else extraInfo += ` <i style = "color: darkgray">` + currentCourses[i].workflow_state + "</i>"
            if (currentCourses[i].end_at != null) {
                let endAtDate = new Date(currentCourses[i].end_at)
                if (endAtDate.getTime() <= secondQuarterDate.getTime()) extraInfo += ` <i style = "color: gray">first semester</i>`
                else if (endAtDate.getTime() <= fourthQuarterDate.getTime()) extraInfo += ` <i style = "color: gray">second semester</i>`
            }


            let courseButton = document.createElement("button")
            courseButton.classList.add("Button", "Button-primary")
            courseButton.style.margin = "5px"
            courseButton.style.color = "white"
            courseButton.style.transition = "background-color .25s"
            courseButton.style.backgroundColor = color
            courseButton.onmouseover = () => { courseButton.style.backgroundColor = hoverColor }
            courseButton.onmouseleave = () => { courseButton.style.backgroundColor = color }
            courseButton.style.border = "1px solid"
            courseButton.style.borderColor = borderColor
            courseButton.textContent = text
            courseButton.disabled = disabled
            this.wrapper.appendChild(courseButton)
            this.addCourseButtons.push(courseButton)

            let courseLabel = document.createElement("span")
            courseLabel.innerHTML = this.currentCourses[i].name + " (" + this.currentCourses[i].id + ")" + extraInfo + "<br>"
            this.wrapper.appendChild(courseLabel)
            this.addCourseLabels.push(courseLabel)

            courseButton.onclick = () => {
                courseSections.push(new CourseSection({
                    name: this.currentCourses[i].name,
                    id: this.currentCourses[i].id
                }))
                
                courseButton.style.backgroundColor = "var(--fOyUs-backgroundSuccess)"
                courseButton.onmouseover = () => { courseButton.style.backgroundColor = "var(--ic-brand-button--primary-bgd-darkened-5)" }
                courseButton.onmouseleave = () => { courseButton.style.backgroundColor = "var(--fOyUs-backgroundSuccess)" }
                courseButton.style.borderColor = "var(--fOyUs-borderColorSuccess)"
                courseButton.textContent = "Added"
                courseButton.disabled = true
            }
        }

    }

    
    setTermDates() {
        
        if (this.termSelector.value == 1) {
            termStartDate = yearStartDate
            termEndDate = firstQuarterDate
        }
        if (this.termSelector.value == 2) {
            termStartDate = yearStartDate
            termEndDate = secondQuarterDate
        }
        if (this.termSelector.value == 3) {
            termStartDate = secondQuarterDate
            termEndDate = thirdQuarterDate
        }
        if (this.termSelector.value == 4) {
            termStartDate = secondQuarterDate
            termEndDate = fourthQuarterDate
        }
    }

}


class CourseSection extends Section {
    constructor(courseInfo) {
        super(courseInfo.name)

        this.id = courseInfo.id
        this.name = courseInfo.name
        this.index = courseInfo.index
        this.sections = courseInfo.sections
        this.assignments = courseInfo.assignments
        this.grades = courseInfo.grades
        this.assignmentGroups = courseInfo.assignmentGroups
        this.typeSelections = courseInfo.typeSelections
        this.lastSaveDate = courseInfo.lastSaveDate
        this.sows = courseInfo.sows
        if (this.sections == null) this.sections = []
        if (this.assignments == null) this.assignments = []
        if (this.grades == null) this.grades = []
        if (this.assignmentGroups == null) this.assignmentGroups = []
        if (this.typeSelections == null) this.typeSelections = {}
        if (this.lastSaveDate == null) this.lastSaveDate = null
        if (this.sows == null) this.sows = false



        this.sideBarLink = new SectionLink(this.name, this)

        this.removeButton = document.createElement("button")
        this.removeButton.classList.add("Button", "Button-primary")
        this.removeButton.style.marginRight = "10px"
        this.removeButton.style.color = "white"
        this.removeButton.style.transition = "background-color .25s"
        this.removeButton.style.backgroundColor = "var(--fOyUs-backgroundDanger)"
        this.removeButton.onmouseover = () => { this.removeButton.style.backgroundColor = "var(--fOyUs-focusColorDanger)" }
        this.removeButton.onmouseleave = () => { this.removeButton.style.backgroundColor = "var(--fOyUs-backgroundDanger)" }
        this.removeButton.style.border = "1px solid"
        this.removeButton.style.borderColor = "var(--fOyUs-borderColorDanger)"
        this.removeButton.textContent = "Remove This Course"
        this.removeButton.title = "remove this course from your canvas to synergy course list"
        this.wrapper.appendChild(this.removeButton)

        this.removeButton.onclick = () => {
            this.sideBarLink.delete()
            super.delete()

            courseSections.splice(courseSections.indexOf(this), 1)
            saveCourses()
            homeSection.populateCurrentCourses(homeSection.currentCourses)
            homeSection.sideBarLink.link.click()
        }
        
        this.refreshGradesButton = document.createElement("button")
        this.refreshGradesButton.classList.add("Button", "Button-primary")
        this.refreshGradesButton.style.color = "white"
        this.refreshGradesButton.style.transition = "background-color .25s"
        this.refreshGradesButton.style.backgroundColor = "var(--ic-brand-button--primary-bgd)"
        this.refreshGradesButton.onmouseover = () => { this.refreshGradesButton.style.backgroundColor = "var(--ic-brand-button--primary-bgd-darkened-5)" }
        this.refreshGradesButton.onmouseleave = () => { this.refreshGradesButton.style.backgroundColor = "var(--ic-brand-button--primary-bgd)" }
        this.refreshGradesButton.style.border = "1px solid"
        this.refreshGradesButton.style.borderColor = "var(--ic-brand-button--primary-bgd-darkened-15)"
        this.refreshGradesButton.textContent = "Refresh Grades For This Course"
        this.wrapper.appendChild(this.refreshGradesButton)

        this.loading = new Loading(this.refreshGradesButton)

        this.refreshGradesButton.onclick = () => {
            this.fetchGrades()

            this.loading.startLoading()
        }


        this.typeSelectorWrapper = document.createElement("div")
        this.typeSelectorWrapper.style = `
            margin: 10px;
            width: calc(100% - 100px);`
        this.wrapper.appendChild(this.typeSelectorWrapper)

        this.groupsTitle = document.createElement("span")
        this.groupsTitle.style.float = "left"
        this.groupsTitle.textContent = "Assignment Group (Canvas)"
        this.typeSelectorWrapper.appendChild(this.groupsTitle)

        this.typesTitle = document.createElement("span")
        this.typesTitle.style.float = "right"
        this.typesTitle.textContent = "Assignment Type (Synergy)"
        this.typeSelectorWrapper.appendChild(this.typesTitle)

        this.typeSelectorWrapper.innerHTML += "<br>"


        this.typeMatchers = []

        this.sowsCheckbox
        this.sowsLabel

        this.saveChangesButton
        this.lastSaveDateLabel

        this.downloadFileButtonBreaks = []
        this.downloadFileButtons = []

        this.gradesPreviewTitle
        this.gradesPreviewSectionTitles = []
        this.gradesPreviewTables = []

        this.makeTypeMatchers()
        
    }



    makeTypeMatchers() {
        if (this.gradesPreviewTitle != null) this.gradesPreviewTitle.remove()
        if (this.gradesPreviewSectionTitles[0] != null) for (let i = 0; i < this.gradesPreviewSectionTitles.length; i++) this.gradesPreviewSectionTitles[i].remove()
        if (this.gradesPreviewTables[0] != null) for (let i = 0; i < this.gradesPreviewTables.length; i++) this.gradesPreviewTables[i].remove()
        if (this.downloadFileButtonBreaks[0] != null) for (let i = 0; i < this.downloadFileButtonBreaks.length; i++) this.downloadFileButtonBreaks[i].remove()
        if (this.downloadFileButtons[0] != null) for (let i = 0; i < this.downloadFileButtons.length; i++) this.downloadFileButtons[i].remove()
        if (this.saveChangesButton != null) this.saveChangesButton.remove()
        if (this.lastSaveDateLabel != null) this.lastSaveDateLabel.remove()
        if (this.sowsCheckbox != null) this.sowsCheckbox.remove()
        if (this.sowsLabel != null) this.sowsLabel.remove()

        for (let i = 0; i < this.typeMatchers.length; i++) this.typeMatchers[i].remove()
        this.typeMatchers = []



        for (let i = 0; i < this.assignmentGroups.length; i++) {

            let typeMatcher = document.createElement("div")

            typeMatcher.innerHTML = "<br>"
            
            typeMatcher.style = `
                padding: 0px;
                border-top-style: solid;
                border-color: lightgray`
            this.typeSelectorWrapper.appendChild(typeMatcher)
            this.typeMatchers.push(typeMatcher)

            
            let typeDropdownWrapper = document.createElement("div")
            typeDropdownWrapper.style.float = "right"
            typeMatcher.appendChild(typeDropdownWrapper)

            let typeDropdown = document.createElement("select")
            typeDropdown.style = `
                padding: 10px;
                width: 200px;
                border-radius: 3px;
                color: white;
                background-color: green;
                cursor: pointer;
                transition: background-color .25s;`
            typeDropdown.title = "Select the appropriate Synergy assignment type for the assignment group to the left"
            typeDropdownWrapper.appendChild(typeDropdown)

            for (let j = 0; j < types.length; j++) {
                let typeDropdownOption = document.createElement("option")
                typeDropdownOption.value = types[j]
                typeDropdownOption.textContent = types[j]
                typeDropdown.appendChild(typeDropdownOption)
            }

            if (Object.keys(this.typeSelections).length > 0) typeDropdown.value = this.typeSelections[this.assignmentGroups[i].name]
            this.typeSelections[this.assignmentGroups[i].name] = typeDropdown.value
            typeDropdown.onchange = () => {
                this.typeSelections[this.assignmentGroups[i].name] = typeDropdown.value
            }

            let groupLabel = document.createElement("div")
            groupLabel.style = `
                padding: 10px;
                border-radius: 3px;
                color: white;
                width: 175px;
                background-color: var(--ic-brand-primary);`
            groupLabel.textContent = this.assignmentGroups[i].name
            let groupLabelTitle = ""
            for (let j = 0; j < this.assignments.length; j++) if (this.assignments[j].assignment_group_id == this.assignmentGroups[i].id) groupLabelTitle += this.assignments[j].name + ", "
            groupLabelTitle = groupLabelTitle.slice(0, -2)
            groupLabel.title = groupLabelTitle

            typeMatcher.appendChild(groupLabel)

            

        }


        let sowsCheckbox = document.createElement("input")
        sowsCheckbox.type = "checkbox"
        sowsCheckbox.style.margin = "10px"
        sowsCheckbox.checked = this.sows
        this.wrapper.appendChild(sowsCheckbox)
        this.sowsCheckbox = sowsCheckbox

        let sowsLabel = document.createElement("span")
        sowsLabel.innerHTML = "Show Only When Scored<br><br>"
        this.wrapper.appendChild(sowsLabel)
        this.sowsLabel = sowsLabel

        sowsCheckbox.onclick = () => {
            this.sows = sowsCheckbox.checked
        }
        
        


        let saveChangesButton = document.createElement("button")
        saveChangesButton.classList.add("Button", "Button-primary")
        saveChangesButton.style.color = "white"
        saveChangesButton.style.transition = "background-color .25s"
        saveChangesButton.style.backgroundColor = "var(--ic-brand-button--primary-bgd)"
        saveChangesButton.onmouseover = () => { saveChangesButton.style.backgroundColor = "var(--ic-brand-button--primary-bgd-darkened-5)" }
        saveChangesButton.onmouseleave = () => { saveChangesButton.style.backgroundColor = "var(--ic-brand-button--primary-bgd)" }
        saveChangesButton.style.border = "1px solid"
        saveChangesButton.style.borderColor = "var(--ic-brand-button--primary-bgd-darkened-15)"
        saveChangesButton.textContent = "Save Changes"
        this.wrapper.appendChild(saveChangesButton)
        this.saveChangesButton = saveChangesButton

        let lastSaveDateLabel = document.createElement("span")
        lastSaveDateLabel.style.color = "var(--Vmatu-toggleBackgroundWarning)"
        lastSaveDateLabel.textContent = this.lastSaveDate
        this.wrapper.appendChild(lastSaveDateLabel)
        this.lastSaveDateLabel = lastSaveDateLabel

        saveChangesButton.onclick = () => {
            this.convertGrades()
            this.makeTypeMatchers()
            saveCourses()
        }

        this.convertGrades()



        for (let i = 0; i < this.sections.length; i++) { // create a button for each canvas course section

            let lineBreak = document.createElement("br")
            this.wrapper.appendChild(lineBreak)
            this.downloadFileButtonBreaks.push(lineBreak)

            let downloadFileButton = document.createElement("button")
            downloadFileButton.classList.add("Button", "Button-primary")
            downloadFileButton.style.color = "white"
            downloadFileButton.style.transition = "background-color .25s"
            downloadFileButton.style.backgroundColor = "var(--ic-brand-button--primary-bgd)"
            downloadFileButton.onmouseover = () => { downloadFileButton.style.backgroundColor = "var(--ic-brand-button--primary-bgd-darkened-5)" }
            downloadFileButton.onmouseleave = () => { downloadFileButton.style.backgroundColor = "var(--ic-brand-button--primary-bgd)" }
            downloadFileButton.style.border = "1px solid"
            downloadFileButton.style.borderColor = "var(--ic-brand-button--primary-bgd-darkened-15)"
            downloadFileButton.style.marginTop = "10px"
            downloadFileButton.textContent = "Download " + this.sections[i].name
            downloadFileButton.title = "Download Synergy import file"
            this.wrapper.appendChild(downloadFileButton)
            this.downloadFileButtons.push(downloadFileButton)

            downloadFileButton.onclick = () => { // download synergy import file (a .xls file with grades for this section)
                this.convertGrades()
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


        let previewTitle = document.createElement("h2")
        previewTitle.textContent = "Preview Exports"
        this.wrapper.appendChild(previewTitle)
        this.gradesPreviewTitle = previewTitle

        for (let section in this.convertedGrades) {
            let sectionTitle = document.createElement("h3")
            sectionTitle.textContent = section
            this.wrapper.appendChild(sectionTitle)
            this.gradesPreviewSectionTitles.push(sectionTitle)

            let currentGradesJSON = this.convertedGrades[section]
            
            let tableXML = `<thead valign = "top" style = "background-color: var(--ic-brand-button--primary-bgd); color: white; border: 1px solid white;">`
            tableXML += "<tr>"
            for (let columnName in currentGradesJSON[0]) if (
                columnName == "STUDENT_LAST_NAME" || 
                columnName == "STUDENT_FIRST_NAME" || 
                columnName == "ASSIGNMENT_NAME" || 
                columnName == "OVERALL_SCORE" ||
                columnName == "MAX_SCORE" ||
                columnName == "ASSIGNMENT_TYPE" ||
                columnName == "EXCUSED" ||
                columnName == "SHOW_ONLY_WHEN_SCORED"
            ) tableXML += "<th>" + columnName + "</th>"
            tableXML += "</tr></thead><tbody>"

            for (let i = 0; i < currentGradesJSON.length; i++) {
                tableXML += "<tr>"
                for (let columnName in currentGradesJSON[i]) {
                    if (
                        columnName == "STUDENT_LAST_NAME" || 
                        columnName == "STUDENT_FIRST_NAME" || 
                        columnName == "OVERALL_SCORE" ||
                        columnName == "MAX_SCORE" ||
                        columnName == "ASSIGNMENT_TYPE" ||
                        columnName == "EXCUSED" ||
                        columnName == "SHOW_ONLY_WHEN_SCORED"
                    ) tableXML += `<td style = "border: 1px solid gray;">` + currentGradesJSON[i][columnName] + "</td>"

                    else if (columnName == "ASSIGNMENT_NAME") {
                        tableXML += `<td style = "border: 1px solid gray;"><a href = "` + currentGradesJSON[i]["ASSIGNMENT_DESCRIPTION"].slice(12) + `" target = "_blank">` + currentGradesJSON[i][columnName] + "</a></td>"
                    }
                }
                tableXML += "</tr>"
            }

            tableXML += "</tbody>"

            let sectionTable = document.createElement("table")
            sectionTable.style.maxWidth = "200px"
            sectionTable.style.height = "200px"
            sectionTable.style.overflowX = "auto"
            sectionTable.style.overflowY = "auto"
            sectionTable.style.borderSpacing  = "0"
            sectionTable.style.fontSize = "15px"
            sectionTable.innerHTML = tableXML
            this.wrapper.appendChild(sectionTable)
            this.gradesPreviewTables.push(sectionTable)

        }



    }


    fetchGrades() {
        if (accessToken == null) {
            console.log("access token not entered")
            return
        }
    
        
        getDataAsync(["courses", this.id, "sections", "?include[]=students"], accessToken).then((sections) => {
            this.sections = sections
            console.log(sections)
        })

        getDataAsync(["courses", this.id, "assignments", "?include[]=all_dates"], accessToken).then((assignments) => {
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
            console.log(assignments)

            this.makeTypeMatchers()

            console.log("loading grades")
/*
            var submissionsParameters = "?student_ids[]=all"
            for (let i = 0; i < assignments.length; i++) submissionsParameters += "&assignment_ids[]=" + assignments[i].id

            getDataAsync(["courses", this.id, "students", "submissions", submissionsParameters], accessToken).then((scores) => {
                console.log(scores)
            })
*/
            var assignmentScores = []
            for (let i = 0; i < assignments.length; i++) {
                window.setTimeout(() => {
                    getDataAsync(["courses", this.id, "assignments", assignments[i].id, "submissions"], accessToken).then((scores) => {
                        assignmentScores[i] = scores
        
                        let doneLoadingGrades = true
                        for (let j = 0; j < assignments.length; j++) if (assignmentScores[j] == null) doneLoadingGrades = false
                        if (doneLoadingGrades) {
                            
                            
                            let optimizedGrades = []
                            for (let k = 0; k < assignmentScores.length; k++) {
                                optimizedGrades.push([])
                                for (let l = 0; l < assignmentScores[k].length; l++) {
                                    optimizedGrades[k].push({
                                        user_id: assignmentScores[k][l].user_id,
                                        score: assignmentScores[k][l].score,
                                        excused: assignmentScores[k][l].excused
                                    })
                                }
                            }

                            this.grades = optimizedGrades
                            console.log(assignmentScores)

                            this.convertGrades()
                            this.makeTypeMatchers()
                            saveCourses()

                            this.loading.endAnimation(this.loading)
                        }
                    })
                }, i * 150)
            }
            
        })

        getDataAsync(["courses", this.id, "assignment_groups"], accessToken).then((assignmentGroups) => {
            this.assignmentGroups = assignmentGroups
            console.log(assignmentGroups)

            this.makeTypeMatchers()
        })
    }



    convertGrades() {
        // if any data is missing, return
        if (this.sections == null || this.sections == [] || this.assignments == null || this.assignments == [] || this.grades == null || this.grades == [] || this.assignmentGroups == null || this.assignmentGroups == []) return


        // turn imported data into a JSON
        let exportJSON = {}
        for (let i = 0; i < this.sections.length; i++) {
            let currentSection = this.sections[i].name
            exportJSON[currentSection] = []
            
            if (this.sections[i].students != null) for (let j = 0; j < this.sections[i].students.length; j++) {
                let currentStudent = this.sections[i].students[j]
                for (let k = 0; k < this.grades.length; k++) {
                    if (this.assignments[k].graded_submissions_exist) {
                        
                        let currentAssignmentType
                        for (let l = 0; l < this.assignmentGroups.length; l++) if (this.assignments[k].assignment_group_id == this.assignmentGroups[l].id) currentAssignmentType = this.typeSelections[this.assignmentGroups[l].name]
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
                            "OVERALL_SCORE": (currentScore != null) ? currentScore : "",
                            "ASSIGNMENT_NAME": this.assignments[k].name,
                            "ASSIGNMENT_DESCRIPTION": "Canvas URL: " + this.assignments[k].html_url,
                            "MAX_SCORE": this.assignments[k].points_possible,
                            "POINTS": this.assignments[k].points_possible,
                            "ASSIGNMENT_DATE": assignmentDate.toLocaleDateString(),
                            "DUE_DATE": dueDate.toLocaleDateString(),
                            "SCORE_TYPE": "Raw Score",
                            "ASSIGNMENT_TYPE": currentAssignmentType,
                            "EXCUSED": currentExcused,
                            "SHOW_ONLY_WHEN_SCORED": this.sows
                        })
                    }
                }
            }
        }

        this.convertedGrades = exportJSON
    }


}



function saveCourses() {
    let currentDate = new Date(Date.now())
    for (let i = 0; i < courseSections.length; i++) { courseSections[i].lastSaveDate = " Last Saved At: " + currentDate.toLocaleString(); courseSections[i].makeTypeMatchers() }
    let courseInfos = []
    for (let i = 0; i < courseSections.length; i++) {
        courseInfos.push({
            id: courseSections[i].id,
            name: courseSections[i].name,
            index: courseSections[i].index,
            sections: courseSections[i].sections,
            assignments: courseSections[i].assignments,
            grades: courseSections[i].grades,
            assignmentGroups: courseSections[i].assignmentGroups,
            typeSelections: courseSections[i].typeSelections,
            lastSaveDate: courseSections[i].lastSaveDate,
            sows: courseSections[i].sows
        })
    }

    chrome.storage.local.set({courseInfos: JSON.stringify(courseInfos)}, () => {
        console.log("courses saved")
    })
}

var homeSection = new HomeSection()

headerHomeLink.onclick = () => {
    homeSection.sideBarLink.link.click()
}


homeSection.sideBarLink.link.click()


var courseSections = []

function getCoursesAsync() {

    getDataAsync(["users", "self"], accessToken).then((users) => {
        
        getDataAsync(["users", users[0].id, "courses"], accessToken).then((courses) => {
            let currentDate = new Date(Date.now())
            let currentSchoolYear
            if (currentDate.getMonth() < 4) currentSchoolYear = currentDate.getFullYear()// 0 indexed
            else currentSchoolYear = currentDate.getFullYear() + 1// 0 indexed
            console.log(courses)
            var currentCourses = []
            for (let i = 0; i < courses.length; i++) {
                if (courses[i].sis_course_id != null && courses[i].sis_course_id.indexOf(currentSchoolYear) == 0) {
                    currentCourses.push(courses[i])
                }
            }

            
            homeSection.populateCurrentCourses(currentCourses)

        })
    })

}




chrome.storage.local.get(["accessToken", "types", "courseInfos"], (result) => {
    accessToken = result.accessToken

    homeSection.accessTokenInput.value = accessToken
    if (accessToken != null) getCoursesAsync()

    types = (result.types != null) ? JSON.parse(result.types) : null

    if (result.courseInfos != null) {
        let courseInfos = JSON.parse(result.courseInfos)

        for (let i = 0; i < courseInfos.length; i++) {
            courseSections.push(new CourseSection(courseInfos[i]))
        }
    }
})



