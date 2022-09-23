const Captors = (function(self) {
    let rootEl;
    let dialogEl;
    let logs;
    let startTime;
    
    const fieldNameMap = {
        request: "request_per_second_on_ELB",
        responseClient: "response_rate_client_ELB",
        responseServer: "response_rate_ELB_UI_server",
        cpu: "cpu_used",
        disk: "disk_used",
        memory: "memory_free",
        tenantRequest: "tenant_wise_requests",
        fintech: "Fintech",
        cbc: "CBC",
        insurance: "Insurance",
        dng: "DNG",
        bbps: "BBPS"
    }

    const init = (root) => {
        if(self.App) {
            self.App.destroy();
        }
        rootEl = root;
    }

    const destroy = () => {
        removeDialog();
        delete self.App;
    }

    const run = (time) => {
        startTime = time;
        showDialog();
    }

    const showDialog = () => {
        dialogEl = rootEl.appendChild(createDialogEl());

        requestAnimationFrame(() => {
            dialogEl.animate([
                {transform: "translate(-50%, -50%) scale(1)"},
                {transform: "translate(-50%, -50%) scale(1.1)"},
                {transform: "translate(-50%, -50%) scale(1)"}
            ], {
                duration: 400,
                iterations: 2,
                easing: "ease-out"
            });
        })
    }

    const removeDialog = () => {
        dialogEl.remove();
    }

    const createDialogEl = () => {
        const el = self.document.createElement("div");
        el.style.height = "100px";
        el.style.padding = "34px"
        el.style.position = "fixed";
        el.style.top = "50%";
        el.style.left = "50%";
        el.style.background = "ghostwhite";
        el.style.border = "2px solid cornflowerblue";
        el.style.borderRadius = "4px";
        el.style.transform = "translate(-50%, -50%)";

        const filePickerEl = el.appendChild(createFilePickerEl());

        const doneButtonEl = el.appendChild(self.document.createElement("button"));
        doneButtonEl.textContent = "Done";
        doneButtonEl.addEventListener("click", onDialogClose);

        return el;
    }

    const createFilePickerEl = () => {
        const el = self.document.createElement("input");
        el.setAttribute("type", "file");

        el.addEventListener("change", onFilePickerChange);

        return el;
    }

    const onFilePickerChange = (event) => {
        const fileReader = new FileReader();
        fileReader.addEventListener("load", () => {
            logs = JSON.parse(fileReader.result);
        });

        fileReader.readAsText(event.target.files[0]);
    }

    const onDialogClose = () => {
        removeDialog();
        if(logs) {
            populateData(logs);
        }
    }

    const populateData = (logs) => {
        const startData = logs.find(item => item.startTime.includes(startTime));
        if(!startData) {
            console.warn("Invalid startTime");
        }
        const startIndex = logs.indexOf(startData);

        console.log(logs);
        for(let i = startIndex; i < logs.length; i += 2) {
            const data = logs[i];
            const [hr, min] = data.startTime.split(" ")[4].split(":");
            const time = [hr, min].join(":");
            const cellEls = grabRowCellEls(time);
            writeData(cellEls, data)
        }
    }

    const grabRowCellEls = (time) => {
        if(!time) {
            console.log("Invalid time", time);
            return;
        }
        console.log("Time: ", time);

        const rowEl = Array.from(rootEl.querySelectorAll("td"))
            .find(el => el.textContent === time)
            .parentElement;
        
        const cellEls = {};

        const requestCellEls = rowEl.children[1].querySelectorAll("td");
        cellEls[fieldNameMap.request] = {
            min: requestCellEls[0],
            max: requestCellEls[1],
            mean: requestCellEls[2]
        }

        const responseClientCellEls = rowEl.children[2].querySelectorAll("td");
        cellEls[fieldNameMap.responseClient] = {
            min: responseClientCellEls[0],
            max: responseClientCellEls[1],
            mean: responseClientCellEls[2]
        }

        const responseServerCellEls = rowEl.children[3].querySelectorAll("td");
        cellEls[fieldNameMap.responseServer] = {
            min: responseServerCellEls[0],
            max: responseServerCellEls[1],
            mean: responseServerCellEls[2]
        }

        const cpuCellEls = rowEl.children[4].querySelector("tbody").children[1].children;
        cellEls[fieldNameMap.cpu] = {
            min: cpuCellEls[1],
            max: cpuCellEls[2],
            mean: cpuCellEls[3]
        }

        const diskCellEls = rowEl.children[4].querySelector("tbody").children[2].children;
        cellEls[fieldNameMap.disk] = {
            min: diskCellEls[1],
            max: diskCellEls[2],
            mean: diskCellEls[3]
        }

        const memoryCellEls = rowEl.children[4].querySelector("tbody").children[3].children;
        cellEls[fieldNameMap.memory] = {
            min: memoryCellEls[1],
            max: memoryCellEls[2],
            mean: memoryCellEls[3]
        }

        const fintechCellEls = rowEl.children[5].querySelector("tbody").children[1].children;
        cellEls[fieldNameMap.fintech] = {
            total: fintechCellEls[1],
            success: fintechCellEls[2],
            failure: fintechCellEls[3]
        }

        const bbpsCellEls = rowEl.children[5].querySelector("tbody").children[2].children;
        cellEls[fieldNameMap.bbps] = {
            total: bbpsCellEls[1],
            success: bbpsCellEls[2],
            failure: bbpsCellEls[3]
        }

        const insuranceCellEls = rowEl.children[5].querySelector("tbody").children[3].children;
        cellEls[fieldNameMap.insurance] = {
            total: insuranceCellEls[1],
            success: insuranceCellEls[2],
            failure: insuranceCellEls[3]
        }

        const cbcCellEls = rowEl.children[5].querySelector("tbody").children[4].children;
        cellEls[fieldNameMap.cbc] = {
            total: cbcCellEls[1],
            success: cbcCellEls[2],
            failure: cbcCellEls[3]
        }

        const dngCellEls = rowEl.children[5].querySelector("tbody").children[5].children;
        cellEls[fieldNameMap.dng] = {
            total: dngCellEls[1],
            success: dngCellEls[2],
            failure: dngCellEls[3]
        }

        return cellEls;
    }

    const writeData = (cellEls, data) => {
        const traffic = data.trafic;
        const health = data.health;

        traffic.forEach(({query, result, results}) => {
            if(query === fieldNameMap.tenantRequest) {
                results.forEach(result => {
                    cellEls[result.tenant].total.textContent = result.total_request;
                    cellEls[result.tenant].success.textContent = result.success;
                    cellEls[result.tenant].failure.textContent = result.failure;
                });
                return;
            }

            cellEls[query].min.textContent = result.min;
            cellEls[query].max.textContent = result.max;
            cellEls[query].mean.textContent = result.avg;
        });

        health.forEach(({query, result}) => {
            cellEls[query].min.textContent = result.min;
            cellEls[query].max.textContent = result.max;
            cellEls[query].mean.textContent = result.avg;
        });
    }

    return {
        init,
        destroy,
        run
    }
}(window));

Captors.init(document.getElementById("tinymce"));
