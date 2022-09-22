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