const styleButton = document.createElement("style");
const buttonStyle = `
button {
    padding: .5em;
    margin: 3px;
}
`;
styleButton.innerHTML = buttonStyle;
document.head.appendChild(styleButton);

class Paginate {
    constructor(state, dataPerPage) {
        this.state = state;
        this.dataPerPage = dataPerPage;
        this.page = 1;
    }
    pageListener(value) {}
    set setDataPerPage(dataPerPage) {
        this.dataPerPage = dataPerPage;
    }
    get getDataPerPage() {
        return this.dataPerPage;
    }
    set setPage(page) {
        this.page = page;
    }
    get getPage() {
        return this.page;
    }
    groupDataInPages() {
        const trimStart = (this.page - 1) * this.dataPerPage;
        const trimEnd = trimStart + this.dataPerPage;
        const trimmedData = this.state.slice(trimStart, trimEnd);
        const pages = Math.round(this.state.length / this.dataPerPage);

        return {
            "querySet": trimmedData,
            "pages": pages
        }
    }
    pageButtons(pages, externalWrapper) {
        const wrapper = document.createElement("div");
        wrapper.className = "wrapper";

        if (externalWrapper.hasChildNodes()) {
            externalWrapper.innerHTML = ``;
        }

        externalWrapper.appendChild(wrapper);

        let maxLeft = (this.getPage - Math.floor(this.dataPerPage / 2));
        let maxRight = (this.getPage + Math.floor(this.dataPerPage / 2));

        if (maxLeft < 1) {
            maxLeft = 1;
            maxRight = this.dataPerPage
        }
        if (maxRight > pages) {
            maxLeft = pages - (this.dataPerPage - 1);

            if (maxLeft < 1) {
                maxLeft = 1
            }
            maxRight = pages;
        }

        if (pages > 1) {
            for (let page = maxLeft; page <= maxRight; page++) {
                wrapper.innerHTML += `<button value=${page} class="page">${page}</button>`;
            }
        }

        //set color to the selected page button
        const currentPage = document.querySelector(`button[value=\'${this.getPage}\']`)
        if (currentPage) {
            currentPage.style.background = "rgb(144,238,144)";
        }

        if (this.getPage != 1) {
            wrapper.innerHTML = `<button value=${1} class="page">&#171; First</button>` + wrapper.innerHTML;
        }
        if (this.getPage != pages) {
            wrapper.innerHTML += `<button value=${pages} class="page">Last &#187;</button>`;
        }

        const _this = this;
        document.querySelectorAll(".page").forEach((pagebutton) => {
            pagebutton.onclick = function() {
                _this.setPage = Number(this.value);
                _this.paginate(externalWrapper);
                _this.pageListener(Number(this.value));

            }
        })
        return wrapper;
    }
    paginate(documentElement) {
        this.pageButtons(this.groupDataInPages().pages, documentElement);
    }
    registerListener(listener) {
        this.pageListener = listener;
    }
}
/*
const paginate = new Paginate(data, 3);

const buttons = document.querySelector(".buttons");

paginate.paginate(buttons);

paginate.registerListener((function(value) {
    // console.log(`Data changed ${value}`);
    const datum = paginate.groupDataInPages();
    console.log(datum);
}));*/