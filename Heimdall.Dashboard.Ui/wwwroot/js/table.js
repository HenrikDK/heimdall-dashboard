function sortRows(sorting, columns, rows){  
    if (!rows.length || !sorting?.length) {
      return rows
    }
    
    // Filter out sortings that correspond to non existing columns
    const availableSorting = sorting.filter(s =>
      {
        let column = columns.find(x => x.id === s.id);
        if (!column) return false
        return column.canSort ?? true
      }
    );
  
    const columnInfos = {}
    availableSorting.forEach(s => {
      const column = columns.find(x => x.id === s.id)
      if(!column) return
  
      columnInfos[s.id] = {
        accessor: column.accessor,
        direction: s.sort,
        sorter: getSortFn(column.sorter),
      }
    });
    
    return sortData(rows, availableSorting, columnInfos)
}
  
function filterRows(rows, columns, namespaces, search){
    if ((search === undefined || search?.length === 0) && (namespaces === undefined || namespaces?.length === 0)) return;
    
    const filterColumns = columns.filter(x => (x.canFilter ?? true))
    let nsColumn = columns.filter(x => x.header === 'Namespace')[0]
    let tokens = [];
    if (search?.length > 0){
      tokens = search.trim().split(' ')
    }
    
    rows.forEach(row => {
      if (namespaces.length){
        let val = nsColumn.accessor(row);
        row.nsFiltered = !namespaces.includes(val);
      }
      
      if (tokens.length){
        let values = filterColumns.map(fc => {
           let val = fc.accessor(row);
           
           if (typeof val === 'object'){
             return JSON.stringify(val)
           }
           return '' + val
        })
        
        row.filtered = !values.some(x => tokens.every(y => x.includes(y)))
      }
    });
}
  
function sortData(rows, sorting, columnInfos){
    const sortedData = [...rows]
  
    sortedData.sort((rowA, rowB) => {
      for (let i = 0; i < sorting.length; i += 1) {
        const sortEntry = sorting[i]
        const columnInfo = columnInfos[sortEntry.id]
        const isDesc = columnInfo?.direction === 'desc' ?? false
  
        let valA = columnInfo.accessor(rowA)
        let valB = columnInfo.accessor(rowB)
        let sortInt = columnInfo.sorter(valA, valB)
  
        if (sortInt !== 0) {
          if (isDesc) {
            sortInt *= -1
          }
          
          return sortInt
        }
      }
  
      return rows.indexOf(rowA) - rows.indexOf(rowB)
    })
  
    return sortedData
}
  
function getSortFn(sorter = 'textCS'){
    if (typeof sorter === 'function'){
      return sorter
    }
    
    let compare = text;
    if (sorter === 'an'){
      compare = alphanumeric;
    }
    if (sorter === 'anCS'){
      compare = alphanumericCaseSensitive
    }
    if (sorter === 'textCS'){
      compare = textCaseSensitive
    }
    if (sorter === 'datetime'){
      compare = datetime
    }
    if (sorter === 'number'){
      compare = number  
    }
    return compare;
}
  
function number(a, b) {
    return a === b ? 0 : a > b ? 1 : -1
}
  
function alphanumeric(valA, valB){
    const a = toString(valA).toLowerCase();
    const b = toString(valB).toLowerCase();
    return compareAlphanumeric(a, b);
}
  
function alphanumericCaseSensitive(valA, valB){
    const a = toString(valA);
    const b = toString(valB);
    return compareAlphanumeric(a, b);
}
  
// The text filter is more basic (less numeric support), but is much faster
function text(textA, textB) {
    const a = toString(textA).toLowerCase();
    const b = toString(textB).toLowerCase(); 
    
    return a === b ? 0 : a > b ? 1 : -1
}
  
// The text filter is more basic (less numeric support), but is much faster
function textCaseSensitive(textA, textB){
    const a = toString(textA);
    const b = toString(textB);
    return a === b ? 0 : a > b ? 1 : -1
}
  
// Can handle nullish values
function datetime(dateA, dateB){
    const a = dateA;
    const b = dateB;
  
    // Use > and < because == (and ===) doesn't work with
    // Date objects (would require calling getTime()).
    return a > b ? 1 : a < b ? -1 : 0
}
  
function toString(a) {
    if (typeof a === 'number') {
      if (isNaN(a) || a === Infinity || a === -Infinity) {
        return ''
      }
      return String(a)
    }
    if (typeof a === 'string') {
      return a
    }
    return ''
}

// Mixed sorting is slow, but very inclusive of many edge cases.
// It handles numbers, mixed alphanumeric combinations, and even null, undefined, and Infinity
function compareAlphanumeric(aStr, bStr) {
    const reSplitAlphaNumeric = /([0-9]+)/gm
  
    const a = aStr.split(reSplitAlphaNumeric).filter(Boolean)
    const b = bStr.split(reSplitAlphaNumeric).filter(Boolean)
  
    while (a.length && b.length) {
      const aa = a.shift()
      const bb = b.shift()
  
      const an = parseInt(aa, 10)
      const bn = parseInt(bb, 10)
  
      const combo = [an, bn].sort()
  
      // Both are string
      if (isNaN(combo[0])) {
        if (aa > bb) {
          return 1
        }
        if (bb > aa) {
          return -1
        }
        continue
      }
  
      // One is a string, one is a number
      if (isNaN(combo[1])) {
        return isNaN(an) ? -1 : 1
      }
  
      // Both are numbers
      if (an > bn) {
        return 1
      }
      if (bn > an) {
        return -1
      }
    }
  
    return a.length - b.length
}