


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


function getData(specifications) {

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






function getStuff(url) {

    let xhr = new XMLHttpRequest()

    xhr.open("GET", url)
    xhr.send()

    return new Promise((resolve) => {
        xhr.onreadystatechange = () => {
            if (xhr.readyState == 4) resolve(xhr)
        }
    })
}



async function getDataAsync(specifications) {

    let donePaginating = false
    let maxPaginations = 100
    let paginationCounter = 0

    let returnJSON = []

    let url = "https://lms.pps.net/api/v1"
    for (let i = 0; i < specifications.length; i++) url += "/" + specifications[i]


    while (!donePaginating && paginationCounter < maxPaginations) {
        paginationCounter++

        let xhr = await getStuff(url)

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




// UI INTEGRATION //


var canvasMenu = document.getElementById("menu")

if (canvasMenu != null) {

var types = []

var canvasWrapper = document.getElementById("wrapper")

var interfaceButton = document.createElement("button")
interfaceButton.style.width = "100%"
interfaceButton.style.height = "65px"
interfaceButton.style.backgroundColor = "transparent"
interfaceButton.onmouseover = () => { interfaceButton.style.backgroundColor = "rgba(0,0,0,.2)" }
interfaceButton.onmouseleave = () => { interfaceButton.style.backgroundColor = "transparent" }
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



window.onresize = () => {
    mainWrapper.style.left = canvasMenu.offsetWidth + "px"
    mainWrapper.style.backgroundColor = "white"
    mainWrapper.style.width = "calc(100% - " + canvasMenu.offsetWidth + "px)"
    mainWrapper.style.height = window.innerHeight + "px"
}




canvasMenu.onclick = (event) => {
    let clickedOnInterfaceButton = false
    for (let i = 0; i < event.composedPath().length; i++) if (event.composedPath()[i] == interfaceButton) clickedOnInterfaceButton = true
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
        interfaceButton.onmouseover = () => { }
        interfaceButton.onmouseleave = () => { }
    }
    else {
        interfaceButton.style.backgroundColor = "transparent"
        for (let i = 0; i < event.composedPath().length; i++) {
            if (event.composedPath()[i].classList != null && event.composedPath()[i].classList.contains("ic-icon-svg")) event.composedPath()[i].style.fill = "var(--ic-brand-global-nav-ic-icon-svg-fill--active)"
            if (event.composedPath()[i].classList != null && event.composedPath()[i].classList.contains("menu-item__text")) event.composedPath()[i].style.color = "var(--ic-brand-global-nav-ic-icon-svg-fill--active)"
            if (event.composedPath()[i].classList != null && event.composedPath()[i].classList.contains("ic-app-header__menu-list-link")) event.composedPath()[i].style.backgroundColor = "#fff"
        }
    }
}

document.onclick = (event) => {
    if (mainWrapper.style.display == "" && event.composedPath().find(element => element == canvasMenu) == null) {
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
sideBarWrapper.style.top = "100px"
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
    constructor(size, parent) {
        this.image = document.createElement("img")
        this.image.src = "https://i.imgur.com/XgIwQf9.png"
        this.image.classList.add("loadingImage")
        this.image.style.width = size + "px"
        this.image.style.height = size + "px"
        this.image.style.marginLeft = "10px"
        parent.appendChild(this.image)

    }

    startLoading() {
        this.image.src = "https://i.imgur.com/XgIwQf9.png"
        this.angle = 0
        this.interval = setInterval(this.refresh, 20, this)
    }

    refresh(object) {
        object.angle += .075
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
        this.wrapper.style.top = "72px"
        this.wrapper.style.left = "225px"
        this.wrapper.style.width = "calc(100% - 225px)"
        this.wrapper.style.height = "calc(100% - 72px)"
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


class HomeSection extends Section {
    constructor() {
        super("Canvas To Synergy")


        this.sideBarLink = new SectionLink("Home", this)


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
            this.setTermDates()

            chrome.storage.local.set({currentTerm: this.termSelector.value}).then(() => {
                console.log("current term saved")
            })
        }
        
        this.termSelectorLineBreak = document.createElement("br")
        this.wrapper.appendChild(this.termSelectorLineBreak)

        this.coursesLoading = new Loading(35, this.wrapper)
        this.coursesLoading.startLoading()

        getCoursesAsync()


        this.currentCourses = []

        this.addCourseLabels = []
        this.addCourseButtons = []

    }

    populateCurrentCourses(currentCourses) {

        for (let i = 0; i < this.addCourseLabels.length; i++) this.addCourseLabels[i].remove()
        for (let i = 0; i < this.addCourseButtons.length; i++) this.addCourseButtons[i].remove()

        if (this.coursesLoading.image != null) this.coursesLoading.image.remove()

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
            courseLabel.innerHTML = `<a href = "https://lms.pps.net/courses/` + this.currentCourses[i].id + `" target = "_blank">` + this.currentCourses[i].name + "</a> (" + this.currentCourses[i].id + ")" + extraInfo + "<br>"
            this.wrapper.appendChild(courseLabel)
            this.addCourseLabels.push(courseLabel)

            courseButton.onclick = () => {
                courseSections.push(new CourseSection({
                    name: this.currentCourses[i].name,
                    id: this.currentCourses[i].id
                }))
                
                courseButton.style.backgroundColor = "#0B874B"
                courseButton.onmouseover = () => { courseButton.style.backgroundColor = "#0B874B" }
                courseButton.onmouseleave = () => { courseButton.style.backgroundColor = "#0B874B" }
                courseButton.style.borderColor = "#0B874B"
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


class SettingsSection extends Section {

    constructor() {
        super("Settings")
        
        this.sideBarLink = new SectionLink("Settings", this)
        

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

                for (let i = 0; i < courseSections.length; i++) courseSections[i].makeTypeMatchers()
        
                chrome.storage.local.set({types: JSON.stringify(types)}, () => {
                    console.log("types saved")
                })
            }
        }


        this.fileLineBreak = document.createElement("br")
        this.wrapper.appendChild(this.fileLineBreak)


        
        this.getRawDataLabel = document.createElement("h3")
        this.getRawDataLabel.textContent = "Fetch Raw Data"
        this.wrapper.appendChild(this.getRawDataLabel)


        this.getRawDataInput = document.createElement("input")
        this.getRawDataInput.type = "text"
        this.wrapper.appendChild(this.getRawDataInput)

        this.getButton = document.createElement("button")
        this.getButton.classList.add("Button", "Button-primary")
        this.getButton.style.marginLeft = "10px"
        this.getButton.style.color = "white"
        this.getButton.style.transition = "background-color .25s"
        this.getButton.style.backgroundColor = "var(--ic-brand-button--primary-bgd)"
        this.getButton.onmouseover = () => { this.getButton.style.backgroundColor = "var(--ic-brand-button--primary-bgd-darkened-5)" }
        this.getButton.onmouseleave = () => { this.getButton.style.backgroundColor = "var(--ic-brand-button--primary-bgd)" }
        this.getButton.style.border = "1px solid"
        this.getButton.style.borderColor = "var(--ic-brand-button--primary-bgd-darkened-15)"
        this.getButton.textContent = "GET"
        this.wrapper.appendChild(this.getButton)

        this.getLoading = new Loading(27.5, this.wrapper)

        this.rawDataText = document.createElement("code")
        this.rawDataText.style.backgroundColor = "transparent"
        this.rawDataText.style.borderStyle = "none"
        this.rawDataText.style.color = "rgb(50, 0, 0)"
        this.rawDataText.innerHTML = "<br>"
        this.wrapper.appendChild(this.rawDataText)

        this.getButton.onclick = async () => {
            this.getLoading.startLoading()
            try {
                let data = await getDataAsync([this.getRawDataInput.value])
                let rawData = "<br>" + JSON.stringify(data, null, "\t")
                for (let i = rawData.length - 1; i >= 0 ; i--) if (rawData[i] == "\n") rawData = rawData.slice(0, i) + "<br>" + rawData.slice(i)
                for (let i = rawData.length - 1; i >= 0 ; i--) if (rawData[i] == "\t") rawData = rawData.slice(0, i) + "&emsp;" + rawData.slice(i)

                this.rawDataText.innerHTML = rawData

                this.getLoading.endAnimation(this.getLoading)
            }
            catch {
                this.rawDataText.innerHTML = "<br>failed to retrieve :("

                this.getLoading.endAnimation(this.getLoading)
            }
        }
    }

    
}


class HelpSection extends Section {
    constructor() {
        super("Help")

        this.sideBarLink = new SectionLink("Help", this)
        

        this.instructionsBody = document.createElement("p")
        this.instructionsBody.innerHTML = `
        <br><i style = "color: green;"><b>On First Time Use</b></i>
        <br> - Go to <b>Import Assignments</b> under the <b>Grade Book</b> dropdown menu in Synergy
        <br> - Click on the <b>Download Sample File</b> button
        <br> - Upload this file to Canvas To Synergy in the <b>Settings</b> page
        <br>
        <br><i style = "color: green;"><b>On Everyday Use</b></i><i style = "color: gray"> (steps elaborated upon further down)</i>
        <br> - In the Canvas To Synergy <b>Home</b> page select the grading period you would like to import grades for
        <br> - Refresh Grades for your courses
        <br> - Download Synergy import files
        <br> - Upload files to Synergy
        <br>
        <br><i style = "color: green;"><b>Adding Courses</b></i>
        <br> - In the Canvas To Synergy <b>Home</b> page, click <b>+ Add</b> next to courses that you would like to use with Canvas To Synergy
        <br>
        <br><i style = "color: green;"><b>Removing Courses</b></i>
        <br> - In a Canvas To Synergy course page, click <b>Remove This Course</b>
        <br><i style = "color: gray">&emsp; - This only affects your Canvas To Synergy preferences, Canvas To Synergy cannot delete your actual courses</i>
        <br>
        <br><i style = "color: green;"><b>Loading Grades</b></i><i style = "color: gray"> (for each course)</i>
        <br> - In a Canvas To Synergy course page, click <b>Refresh Grades For This Course</b>
        <br> - Wait until loading has finished before moving on to downloading Synergy import files
        <br>
        <br><i style = "color: green;"><b>Configuring Export Settings</b></i><i style = "color: gray"> (for each course)</i>
        <br> - Select the Synergy assignment types from the dropdowns that match the Canvas assignment groups on the left (for assignment weighting)
        <br> - If you'd like ungraded submissions to be hidden in Synergy, check the <b>Show Only When Scored</b> checkbox
        <br> - Save changes by clicking the <b>Save Changes</b> button
        <br>
        <br><i style = "color: green;"><b>Downloading Synergy Import Files</b></i><i style = "color: gray"> (for each course section)</i>
        <br> - In a Canvas To Synergy course page, click on the <b>Download</b> button corresponding with the section you would like to download grades for
        <br>
        <br><i style = "color: green;"><b>Importing grades to Synergy</b></i><i style = "color: gray"> (for each course section)</i>
        <br> - Go to <b>Import Assignments</b> under the <b>Grade Book</b> dropdown menu in Synergy
        <br> - Make sure you are in the desired course section
        <br> - Turn on the first and third settings
        <br> - Select or drag and drop the corresponding Canvas To Synergy download file into the file selector
        <br> - If errors appear, consult the <i style = "color: darkred;">Possible Causes For Error</i> section below
        <br> - Review the uploaded grades if you'd like to, and click <b>Import Data</b>
        <br> - Check gradebook to make sure grades were imported correctly
        <br>
        <br><i style = "color: darkred;"><b>Possible Causes For Error</b></i><i style = "color: gray"> (errors are common -- no need to worry)</i>
        <br> - Make sure you are uploading to the correct course and period number that corresponds with the Canvas To Synergy download file name
        <br> - Make sure there are no extra students in your Canvas course section that are absent from your Synergy course
        <br>&emsp; - If this is the case, try turning on <b>Show Only When Scored</b> in the Canvas To Synergy course page, re-download the file, and try again
        <br> - <span style = "color: darkred;">If the solutions above don't work:</span>
        <br>&emsp; - Turn on the fourth setting in <b>Import Assignments</b> to show detailed error messages and try to manually find the problem
        <br>&emsp; - Email nfenger@pps.net or sunil.williams.4@gmail.com with your error message
        <br>
        <br>
        <br>
        
        `

        this.wrapper.appendChild(this.instructionsBody)


    }


}


class CourseSection extends Section {
    constructor(courseInfo) {
        super(courseInfo.name)

        this.id = courseInfo.id
        this.name = courseInfo.name
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
        this.removeButton.style.backgroundColor = "#E0061F"
        this.removeButton.onmouseover = () => { this.removeButton.style.backgroundColor = "#E0061F" }
        this.removeButton.onmouseleave = () => { this.removeButton.style.backgroundColor = "#E0061F" }
        this.removeButton.style.border = "1px solid"
        this.removeButton.style.borderColor = "#E0061F"
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

        this.loading = new Loading(27.5, this.wrapper)

        this.refreshGradesButton.onclick = () => {
            this.refreshGradesButton.disabled = true

            this.fetchGrades()

            this.loading.startLoading()
        }


        this.exportSettingsTitle = document.createElement("h3")
        this.exportSettingsTitle.style.marginTop = "20px"
        this.exportSettingsTitle.style.marginRight = "20px"
        this.exportSettingsTitle.style.paddingBottom = "10px"
        this.exportSettingsTitle.style.borderBottomStyle = "dashed"
        this.exportSettingsTitle.style.borderColor = "gray"
        this.exportSettingsTitle.textContent = "Export Settings"
        this.wrapper.appendChild(this.exportSettingsTitle)



        this.typeSelectorWrapper = document.createElement("div")
        this.typeSelectorWrapper.style = `
            margin-top: 15px;
            width: 520px;`
        this.wrapper.appendChild(this.typeSelectorWrapper)

        this.groupsTitle = document.createElement("i")
        this.groupsTitle.style.float = "left"
        this.groupsTitle.style.color = "gray"
        this.groupsTitle.textContent = "Assignment Group (Canvas)"
        this.typeSelectorWrapper.appendChild(this.groupsTitle)

        this.typesTitle = document.createElement("i")
        this.typesTitle.style.float = "right"
        this.typesTitle.style.color = "gray"
        this.typesTitle.textContent = "Assignment Type (Synergy)"
        this.typeSelectorWrapper.appendChild(this.typesTitle)

        this.typeSelectorWrapper.innerHTML += "<br>"


        this.typeMatchers = []

        this.sowsCheckbox
        this.sowsLabel

        this.saveChangesButton
        this.lastSaveDateLabel

        this.downloadTitle

        this.downloadFileButtonBreaks = []
        this.downloadFileButtons = []

        this.gradesPreviewTitle
        this.gradesPreviewSectionTitles = []
        this.gradesPreviewTableWrappers = []
        this.gradesPreviewTables = []

        this.makeTypeMatchers()
        
    }



    makeTypeMatchers() {
        if (this.gradesPreviewTitle != null) this.gradesPreviewTitle.remove()
        if (this.gradesPreviewSectionTitles[0] != null) for (let i = 0; i < this.gradesPreviewSectionTitles.length; i++) this.gradesPreviewSectionTitles[i].remove()
        if (this.gradesPreviewTableWrappers[0] != null) for (let i = 0; i < this.gradesPreviewTableWrappers.length; i++) this.gradesPreviewTableWrappers[i].remove()
        if (this.downloadFileButtonBreaks[0] != null) for (let i = 0; i < this.downloadFileButtonBreaks.length; i++) this.downloadFileButtonBreaks[i].remove()
        if (this.downloadFileButtons[0] != null) for (let i = 0; i < this.downloadFileButtons.length; i++) this.downloadFileButtons[i].remove()
        if (this.saveChangesButton != null) this.saveChangesButton.remove()
        if (this.lastSaveDateLabel != null) this.lastSaveDateLabel.remove()
        if (this.sowsCheckbox != null) this.sowsCheckbox.remove()
        if (this.sowsLabel != null) this.sowsLabel.remove()
        if (this.downloadTitle != null) this.downloadTitle.remove()

        for (let i = 0; i < this.typeMatchers.length; i++) this.typeMatchers[i].remove()
        this.typeMatchers = []



        for (let i = 0; i < this.assignmentGroups.length; i++) {

            let typeMatcher = document.createElement("div")
            
            typeMatcher.style = `
                margin-top: 10px;
                padding-top: 10px;
                border-top-style: dotted;
                border-color: darkgray;`
            this.typeSelectorWrapper.appendChild(typeMatcher)
            this.typeMatchers.push(typeMatcher)

            
            let typeDropdownWrapper = document.createElement("div")
            typeDropdownWrapper.style.float = "right"
            typeMatcher.appendChild(typeDropdownWrapper)

            let typeDropdown = document.createElement("select")
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
                padding: 7.5px 7.5px 7.5px 10px;
                width: 200px;
                background-color: green;
                color: white;
                border-radius: 3px;`
            groupLabel.textContent = this.assignmentGroups[i].name
            let groupLabelTitle = ""
            for (let j = 0; j < this.assignments.length; j++) if (this.assignments[j].assignment_group_id == this.assignmentGroups[i].id) groupLabelTitle += this.assignments[j].name + ", "
            groupLabelTitle = groupLabelTitle.slice(0, -2)
            groupLabel.title = groupLabelTitle

            typeMatcher.appendChild(groupLabel)

            

        }


        let sowsCheckbox = document.createElement("input")
        sowsCheckbox.type = "checkbox"
        sowsCheckbox.style.margin = "20px 15px 20px 10px"
        sowsCheckbox.checked = this.sows
        this.wrapper.appendChild(sowsCheckbox)
        this.sowsCheckbox = sowsCheckbox

        let sowsLabel = document.createElement("span")
        sowsLabel.style.height = "20px"
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

        let lastSaveDateLabel = document.createElement("i")
        lastSaveDateLabel.style.paddingLeft = "5px"
        lastSaveDateLabel.textContent = this.lastSaveDate
        this.wrapper.appendChild(lastSaveDateLabel)
        this.lastSaveDateLabel = lastSaveDateLabel

        saveChangesButton.onclick = () => {
            this.convertGrades()
            this.makeTypeMatchers()
            saveCourses()
        }

        this.convertGrades()


        this.downloadTitle = document.createElement("h3")
        this.downloadTitle.style.marginTop = "20px"
        this.downloadTitle.style.marginRight = "20px"
        this.downloadTitle.style.paddingBottom = "10px"
        this.downloadTitle.style.borderBottomStyle = "dashed"
        this.downloadTitle.style.borderColor = "gray"
        this.downloadTitle.textContent = "Download Exports"
        this.wrapper.appendChild(this.downloadTitle)

        for (let i = 0; i < this.sections.length; i++) { // create a button for each canvas course section

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

            let lineBreak = document.createElement("br")
            this.wrapper.appendChild(lineBreak)
            this.downloadFileButtonBreaks.push(lineBreak)

            downloadFileButton.onclick = () => { // download synergy import file (a .xls file with grades for this section)
                this.convertGrades()
                saveCourses()
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


        this.gradesPreviewTitle = document.createElement("h3")
        this.gradesPreviewTitle.style.marginTop = "20px"
        this.gradesPreviewTitle.style.marginRight = "20px"
        this.gradesPreviewTitle.style.paddingBottom = "10px"
        this.gradesPreviewTitle.style.borderBottomStyle = "dashed"
        this.gradesPreviewTitle.style.borderColor = "gray"
        this.gradesPreviewTitle.textContent = "Preview Exports"
        this.wrapper.appendChild(this.gradesPreviewTitle)

        for (let section in this.convertedGrades) {
            let sectionTitle = document.createElement("h4")
            sectionTitle.style.marginTop = "15px"
            sectionTitle.textContent = section
            this.wrapper.appendChild(sectionTitle)
            this.gradesPreviewSectionTitles.push(sectionTitle)

            let gradesPreviewTableWrapper = document.createElement("div")
            gradesPreviewTableWrapper.style.maxHeight = "300px"
            gradesPreviewTableWrapper.style.width = "1150px"
            gradesPreviewTableWrapper.style.overflowY = "auto"
            this.wrapper.appendChild(gradesPreviewTableWrapper)
            this.gradesPreviewTableWrappers.push(gradesPreviewTableWrapper)

            let currentGradesJSON = this.convertedGrades[section]
            
            let tableXML = `<thead valign = "top" style = "background-color: var(--ic-brand-button--primary-bgd); color: white;">`
            tableXML += "<tr>"
            for (let columnName in currentGradesJSON[0]) if (
                columnName == "STUDENT_LAST_NAME" || 
                columnName == "STUDENT_FIRST_NAME" || 
                columnName == "ASSIGNMENT_NAME" || 
                columnName == "OVERALL_SCORE" ||
                columnName == "MAX_SCORE" ||
                columnName == "ASSIGNMENT_TYPE" ||
                columnName == "EXCUSED"
            ) tableXML += `<th style = "border: 1px solid var(--ic-brand-button--primary-bgd);">` + columnName + "</th>"
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
                        columnName == "EXCUSED"
                    ) tableXML += `<td style = "border: 1px dashed darkgray;">` + currentGradesJSON[i][columnName] + "</td>"

                    else if (columnName == "ASSIGNMENT_NAME") {
                        tableXML += `<td style = "border: 1px dashed darkgray;"><a href = "` + currentGradesJSON[i]["ASSIGNMENT_DESCRIPTION"].slice(12) + `" target = "_blank">` + currentGradesJSON[i][columnName] + "</a></td>"
                    }
                }
                tableXML += "</tr>"
            }

            tableXML += "</tbody>"

            let sectionTable = document.createElement("table")
            sectionTable.style.width = "1150px"
            sectionTable.style.borderSpacing = "5px"
            sectionTable.style.fontSize = "15px"
            sectionTable.innerHTML = tableXML
            gradesPreviewTableWrapper.appendChild(sectionTable)
            this.gradesPreviewTables.push(sectionTable)
            

        }



    }


    fetchGrades() {
    
        
        getDataAsync(["courses", this.id, "sections", "?include[]=students"]).then((sections) => {
            this.sections = sections
            console.log(sections)
        })

        getDataAsync(["courses", this.id, "assignments", "?include[]=all_dates"]).then((assignments) => {
            console.log(assignments)
            for (let i = assignments.length - 1; i >= 0; i--) if (!assignments[i].graded_submissions_exist) assignments.splice(i, 1)
            let optimizedAssignments = []
            for (let i = 0; i < assignments.length; i++) {
                optimizedAssignments.push({
                    assignment_group_id: assignments[i].assignment_group_id,
                    all_dates: assignments[i].all_dates,
                    created_at: assignments[i].created_at,
                    name: assignments[i].name,
                    html_url: assignments[i].html_url,
                    points_possible: assignments[i].points_possible
                })
            }
            this.assignments = optimizedAssignments
            console.log(assignments)

            this.makeTypeMatchers()

            console.log("loading grades")

            if (assignments.length == 0) {
                
                this.grades = []
                console.log("no graded assignments exist")

                this.convertGrades()
                this.makeTypeMatchers()
                saveCourses()

                this.refreshGradesButton.disabled = false

                this.loading.endAnimation(this.loading)
            }

            var assignmentScores = []
            for (let i = 0; i < assignments.length; i++) {
                window.setTimeout(() => {
                    getDataAsync(["courses", this.id, "assignments", assignments[i].id, "submissions"]).then((scores) => {
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

                            this.refreshGradesButton.disabled = false

                            this.loading.endAnimation(this.loading)
                        }
                    })
                }, i * 150)
            }
            
        })

        getDataAsync(["courses", this.id, "assignment_groups"]).then((assignmentGroups) => {
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
                for (let k = 0; k < this.grades.length; k++) if (this.assignments[k] != null) {
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

                    let currentDate = this.assignments[k].all_dates[0]
                    for (let l = 0; l < this.assignments[k].all_dates.length; l++) {
                        if (this.assignments[k].all_dates[l].title == currentSection) {
                            currentDate = this.assignments[k].all_dates[l]
                        }
                    }

                    let assignmentDate = new Date(this.assignments[k].created_at)
                    let dueDate = new Date(currentDate.due_at)

                    if (assignmentDate.getTime() < termStartDate.getTime()) assignmentDate = termStartDate
                    else if (assignmentDate.getTime() > termEndDate.getTime()) assignmentDate = termEndDate

                    if (dueDate.getTime() < termStartDate.getTime()) {
                        dueDate = termStartDate
                    }
                    else if (dueDate.getTime() > termEndDate.getTime()) {
                        dueDate = termEndDate
                    }

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
var settingsSection = new SettingsSection()
var helpSection = new HelpSection()

headerHomeLink.onclick = () => {
    homeSection.sideBarLink.link.click()
}


homeSection.sideBarLink.link.click()


var courseSections = []

function getCoursesAsync() {
        
        getDataAsync(["users", "self", "courses"]).then((courses) => {
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

}




chrome.storage.local.get(["types", "courseInfos"], (result) => {

    types = (result.types != null) ? JSON.parse(result.types) : []

    if (result.courseInfos != null) {
        let courseInfos = JSON.parse(result.courseInfos)

        for (let i = 0; i < courseInfos.length; i++) {
            courseSections.push(new CourseSection(courseInfos[i]))
        }
    }
})

}

