
function parseD(date) {
    let format = true; // true is mm/dd/yyyy, false is yyyy-mm-dd
    if (date.includes('/')) {
        format = true;
        var date = date.split('/');
    } else if (date.includes('-')) {
        format = false;
        var date = date.split('-');
    } else if (date.toLowerCase().trim() == 'unknown') {
        return null;
    } else {
        return null;
    }

    if (format) {
        // mm/dd/yyyy
        var month = parseInt(date[0]) - 1;
        var day = parseInt(date[1]);
        
        // if year is 2 digits, assume 20th century
        if (date[2].length == 2) {
            var year = parseInt('20' + date[2]);
        } else {
            var year = parseInt(date[2]);
        }
    } else {
        // yyyy-mm-dd
        var month = parseInt(date[1]) - 1;
        var day = parseInt(date[2]);

        // if year is 2 digits, assume 20th century
        if (date[0].length == 2) {
            var year = parseInt('20' + date[0]);
        } else {
            var year = parseInt(date[0]);
        }
    }

    return new Date(year, month, day);
}


export default function extractDate(earlyLate = true, dataarr) {
    // if (earlyLate) {
    //     console.log('fetching earliest date from:', dataarr);
    // } else {
    //     console.log('fetching latest date from:', dataarr);
    // }
    // columns we want to check:
    // outbreak_date,date_detected,date_collected,date_confirmed,date_occurred_low_end,date_occurred_high_end
    // 5,6,7,8,12,13
    // data is either mm/dd/yyyy or mm/dd/yy or yyyy-mm-dd 

    let alldates = [];
    for (let i = 5; i < 9; i++) {

        if (dataarr[i] == null || dataarr[i] == '') {
            continue;
        }

        let nd = parseD(dataarr[i]);

        if (nd == null) {
            continue;
        } else {
            alldates.push(nd);
        }
        
    }

    // get 12 and 13
    if (dataarr[12] != null && dataarr[12] != '') { 
        alldates.push(parseD(dataarr[12]));
    }
    if (dataarr[13] != null && dataarr[13] != '') {
        alldates.push(parseD(dataarr[13]));
    }

    // console.log('dates:', alldates);

    if (alldates.length == 0) {
        return null;
    }

    alldates.sort((a, b) => a - b);
    if (earlyLate) {
        return alldates[0];
    } else {
        return alldates[alldates.length - 1];
    }
}