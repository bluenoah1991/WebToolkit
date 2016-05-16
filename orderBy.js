Array.orderBy = function (list, del, begin, end) {
    if (typeof begin === 'undefined') {
        begin = 0;
    }
    if (typeof end === 'undefined') {
        end = list.length - 1;
    }
    if (begin >= end) {
        return;
    }
    var i = begin;
    var j = end;
    var pivot_value = list[i];
    while (i < j) {
        while (i < j && del(pivot_value, list[j]) <= 0) {
            j--;
        }
        list[i] = list[j];
        while (i < j && del(pivot_value, list[i]) >= 0) {
            i++;
        }
        list[j] = list[i];
    }
    list[i] = pivot_value;
    Array.orderBy(list, del, begin, i - 1);
    Array.orderBy(list, del, i + 1, end);
}
