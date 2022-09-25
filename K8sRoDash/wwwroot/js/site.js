var mixinArray = [];
var components = {};
var routes = []

let nsEndsWith = (ns, ends) => {
    let value = false;
    value = ends.some(element => {
        return ns.endsWith(element);
    });
    return value;
};

let filterName = (name, ns) => {
    let value = false;
    value = ns.some(element => {
        return name.toLowerCase().includes(element);
    });
    return value;
};