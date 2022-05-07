const markText = (data,i) => {

    const textLines = [];

    function group(ss, step) {
        var r = [];
        function doGroup(s) {
            if (!s) return;
            r.push(s.substr(0, step));
            s = s.substr(step);
            doGroup(s)
        }
        doGroup(ss);
        return r;
    }

    // Add these text lines to the array to be displayed in the textbox
    textLines.push('标记' + i);
    if (data.location) {
        // var locations = data.location.split(',');
        var locations = [...group(data.location.split(',')[0], 16), ...group(data.location.split(',')[1], 20)];
        locations.map(item => {
            textLines.push(item);
        });
    }

    return textLines;
}

export default markText