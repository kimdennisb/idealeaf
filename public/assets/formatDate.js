module.exports = function(isodate) {
    console.log(typeof isodate, isodate instanceof Date)
    const DateInstance = new Date(isodate);
    const year = DateInstance.getFullYear();
    const month = DateInstance.getMonth();
    const date = DateInstance.getDate();
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    return `${date} ${monthNames[month]} ${year}`;
}