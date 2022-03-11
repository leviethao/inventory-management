export const subtractDateInDays = (date1, date2) => {
    return (date1 - date2) / (24 * 60 * 60 * 1000)
}

export const checkOrderETANotif = (order) => {
    const nearDue = subtractDateInDays(new Date(order?.cells[7].value), new Date()) < 7
    const isDone = order?.cells[11].value == 'Done'
    return (nearDue && !isDone)
}