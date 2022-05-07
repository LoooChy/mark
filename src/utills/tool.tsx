export const chooseTime = (obj, time) => {
    const starts = new Date();
    let end = new Date().getTime();
    let newEnd = new Date(end);
    let bmonth = starts.getMonth() + 1;
    let bday = starts.getDate();
    let emonth = newEnd.getMonth() + 1;
    let eday = newEnd.getDate();
    let Year = new Date().getFullYear();
    let num =
        (Number(Year % 4) === 0 && Number(Year % 100) !== 0) ||
            Number(Year % 400) === 0
            ? 366
            : 365;
    switch (time) {
        case '1': //本周
            end =
                Number(new Date().getDay()) === 1
                    ? starts.getTime()
                    : starts.getTime() - new Date().getDay() * 24 * 3600 * 1000; //本周有问题
            newEnd = new Date(end);
            bmonth = starts.getMonth() + 1;
            bday = starts.getDate();
            emonth = newEnd.getMonth() + 1;
            eday = newEnd.getDate();
            obj['btime'] = `${starts.getFullYear()}-${bmonth >= 10 ? bmonth : '0' + bmonth
                }-${bday >= 10 ? bday : '0' + bday}`;
            obj['etime'] = `${newEnd.getFullYear()}-${emonth >= 10 ? emonth : '0' + emonth
                }-${eday >= 10 ? eday : '0' + eday}`;
            break;
        case '2': //近一月
            end = starts.getTime() - 30 * 24 * 3600 * 1000;
            newEnd = new Date(end);
            bmonth = starts.getMonth() + 1;
            bday = starts.getDate();
            emonth = newEnd.getMonth() + 1;
            eday = newEnd.getDate();
            obj['btime'] = `${starts.getFullYear()}-${bmonth >= 10 ? bmonth : '0' + bmonth
                }-${bday >= 10 ? bday : '0' + bday}`;
            obj['etime'] = `${newEnd.getFullYear()}-${emonth >= 10 ? emonth : '0' + emonth
                }-${eday >= 10 ? eday : '0' + eday}`;
            break;
        case '3': //近一周
            end = starts.getTime() - 6 * 24 * 3600 * 1000;
            newEnd = new Date(end);
            bmonth = starts.getMonth() + 1;
            bday = starts.getDate();
            emonth = newEnd.getMonth() + 1;
            eday = newEnd.getDate();
            obj['btime'] = `${starts.getFullYear()}-${bmonth >= 10 ? bmonth : '0' + bmonth
                }-${bday >= 10 ? bday : '0' + bday}`;
            obj['etime'] = `${newEnd.getFullYear()}-${emonth >= 10 ? emonth : '0' + emonth
                }-${eday >= 10 ? eday : '0' + eday}`;
            break;
        case '4': //近半年
            if (num === 365) {
                end = starts.getTime() - 182 * 24 * 3600 * 1000;
            } else {
                end = starts.getTime() - 183 * 24 * 3600 * 1000;
            }
            newEnd = new Date(end);
            bmonth = starts.getMonth() + 1;
            bday = starts.getDate();
            emonth = newEnd.getMonth() + 1;
            eday = newEnd.getDate();
            obj['btime'] = `${starts.getFullYear()}-${bmonth >= 10 ? bmonth : '0' + bmonth
                }-${bday >= 10 ? bday : '0' + bday}`;
            obj['etime'] = `${newEnd.getFullYear()}-${emonth >= 10 ? emonth : '0' + emonth
                }-${eday >= 10 ? eday : '0' + eday}`;
            break;
        case '5': //近一年
            if (num === 365) {
                end = starts.getTime() - 365 * 24 * 3600 * 1000;
            } else {
                end = starts.getTime() - 366 * 24 * 3600 * 1000;
            }
            newEnd = new Date(end);
            bmonth = starts.getMonth() + 1;
            bday = starts.getDate();
            emonth = newEnd.getMonth() + 1;
            eday = newEnd.getDate();
            obj['btime'] = `${starts.getFullYear()}-${bmonth >= 10 ? bmonth : '0' + bmonth
                }-${bday >= 10 ? bday : '0' + bday}`;
            obj['etime'] = `${newEnd.getFullYear()}-${emonth >= 10 ? emonth : '0' + emonth
                }-${eday >= 10 ? eday : '0' + eday}`;
            break;
        case '6': //当月
            obj['btime'] = `${starts.getFullYear()}-${starts.getMonth() + 1}-1`;
            obj['etime'] = `${starts.getFullYear()}-${starts.getMonth() +
                1}-${starts.getDate()}`;
            break;
        case '7': //近三天
            end = starts.getTime() - 2 * 24 * 3600 * 1000;
            newEnd = new Date(end);
            bmonth = starts.getMonth() + 1;
            bday = starts.getDate();
            emonth = newEnd.getMonth() + 1;
            eday = newEnd.getDate();
            obj['btime'] = `${starts.getFullYear()}-${bmonth >= 10 ? bmonth : '0' + bmonth
                }-${bday >= 10 ? bday : '0' + bday}`;
            obj['etime'] = `${newEnd.getFullYear()}-${emonth >= 10 ? emonth : '0' + emonth
                }-${eday >= 10 ? eday : '0' + eday}`;
            break;
        case '8': //近两天
            end = starts.getTime() - 1 * 24 * 3600 * 1000;
            newEnd = new Date(end);
            bmonth = starts.getMonth() + 1;
            bday = starts.getDate();
            emonth = newEnd.getMonth() + 1;
            eday = newEnd.getDate();
            obj['btime'] = `${starts.getFullYear()}-${bmonth >= 10 ? bmonth : '0' + bmonth
                }-${bday >= 10 ? bday : '0' + bday}`;
            obj['etime'] = `${newEnd.getFullYear()}-${emonth >= 10 ? emonth : '0' + emonth
                }-${eday >= 10 ? eday : '0' + eday}`;
            break;
        case '9': //当天
            end = starts.getTime() - 0 * 24 * 3600 * 1000;
            newEnd = new Date(end);
            bmonth = starts.getMonth() + 1;
            bday = starts.getDate();
            emonth = newEnd.getMonth() + 1;
            eday = newEnd.getDate();
            obj['btime'] = `${starts.getFullYear()}-${bmonth >= 10 ? bmonth : '0' + bmonth
                }-${bday >= 10 ? bday : '0' + bday}`;
            obj['etime'] = `${newEnd.getFullYear()}-${emonth >= 10 ? emonth : '0' + emonth
                }-${eday >= 10 ? eday : '0' + eday}`;
            break;
        default:
            console.log('');
    }
    return obj;
};
