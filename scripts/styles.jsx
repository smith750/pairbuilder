const mainStyle = {
    fontFamily: "Lato, sans-serif",
    fontSize: "14px"
};

const tableCellStyle = {
    padding: "5 10 5 10"
};

const headerStyle = {
    fontSize: "1.5em",
    padding: "10 20 20 30"
};

// from http://www.jankoatwarpspeed.com/css-message-boxes-for-different-message-types/
const validationStyleBase = {
    border: "1px solid",
    margin: "10px 0px",
    padding: "15px 10px 15px 50px",
    backgroundRepeat: "no-repeat",
    backgroundPosition: "10px center"
};

let successStyle = {
    color: "#4F8A10",
    backgroundColor: "#DFF2BF"
};

Object.assign(successStyle, validationStyleBase);

let errorStyle = {
    color: "#D8000C",
    backgroundColor: "#FFBABA"
};

Object.assign(errorStyle, validationStyleBase);

module.exports = {
    mainStyle: mainStyle,
    headerStyle: headerStyle,
    tableCellStyle: tableCellStyle,
    successStyle: successStyle,
    errorStyle: errorStyle
};