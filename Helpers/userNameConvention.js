function IsAlphaNumOrHyphen(username) {
    if ((username < "a" || username > "z") && (username < "A" || username > "Z") && (username < "0" || username > "9") && (username != "-")) {
        return false
    }
    return true;
}

function startsWithHyphen(username) {
    if (username.startsWith("-")) { return true };
    return false;
}

/**
 * checks if the username:
 *  starts with an hyphen
 *  Ends with an hyphen
 *  Has consecutive hyphens
 *  Contain only alphanumeric characters
 */
function usernameRegexConvention(username) {
    const regex = new RegExp("^[A-Za-z0-9]+(-[A-Za-z0-9]+)*$");
    return regex.test(username);
}

module.exports = usernameRegexConvention;