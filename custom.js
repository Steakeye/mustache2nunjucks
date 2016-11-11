function getClosingTagString(aTagName) {
    return '</' + aTagName + '>';
}

function getNextClosingTagIndex(aString, aStartingPoint, aTagName) {
    return aString.indexOf(getClosingTagString(aTagName), aStartingPoint)
}

function getNestedCount(aString, aSubstring, aStartIndex, aEndIndex) {
    return aString.substring(aStartIndex, aEndIndex).split(aSubstring).length - 1;
}

function getNestedOpenTagCount(aString, aTagName, aStartIndex, aEndIndex) {
    return getNestedCount(aString, '<' + aTagName, aStartIndex, aEndIndex);
}

function getNestedCloseTagCount(aString, aTagName, aStartIndex, aEndIndex) {
    return getNestedCount(aString, getClosingTagString(aTagName), aStartIndex, aEndIndex);
}

function getOpenTagMinusCloseTagCount(aString, aTagName, aStartIndex, aEndIndex) {
    return getNestedOpenTagCount(aString, aTagName, aStartIndex, aEndIndex) - getNestedCloseTagCount(aString, aTagName, aStartIndex, aEndIndex);
}

function findNthClosingTagFromPosition(aNum, aString, aTagName, aPosition) {
    while (aNum--) {
        aPosition = getNextClosingTagIndex(aString, aPosition + getClosingTagString(aTagName).length, aTagName)
    }
    return aPosition;
}

function findCorrectClosingTagPosition(aString, aStartingPoint, aTagName) {
    var tNextClosingTagIndex = getNextClosingTagIndex(aString, aStartingPoint, aTagName),
        tOpenTagDiffCount;

    function getOpenTagDiffCount() {
        tOpenTagDiffCount = getOpenTagMinusCloseTagCount(aString, aTagName, aStartingPoint, tNextClosingTagIndex - 1);
        return tOpenTagDiffCount;
    }

    while (getOpenTagDiffCount()  > 0) {
        //console.log("while getOpenTagMinusCloseTagCount > 0", tNextClosingTagIndex);
        tNextClosingTagIndex = findNthClosingTagFromPosition(tOpenTagDiffCount, aString, aTagName, tNextClosingTagIndex);
    }

    return tNextClosingTagIndex;

}

function replaceContentDivWithArticle(aString) {
    var tOpenTagStartFragment = '<div class="column-two-thirds"',
        tOpenTagStart = aString.indexOf(tOpenTagStartFragment),
        tOpenTagEnd = aString.indexOf('>', tOpenTagStart),
        tClosingTagStart = findCorrectClosingTagPosition(aString, tOpenTagEnd + 1, 'div'),
        tClosingTagEnd = aString.indexOf('>', tClosingTagStart),
        tContentPreDiv = aString.substring(0, tOpenTagStart - 1),
        tInnerContent = aString.substring(tOpenTagEnd + 1, tClosingTagStart),
        tContentPostDiv = aString.substring(tClosingTagEnd + 1);

    //console.log('tOpenTagStart',tOpenTagStart);
    //console.log('tOpenTagEnd',tOpenTagEnd);
    //console.log('tNextClosingTag',tClosingTagStart);
    //console.log('tNextOpeningTag',tClosingTagEnd);
    //console.log('innerHtml',tTemplate.substring(tOpenTagEnd + 1, tClosingTagStart));

    return tContentPreDiv + '<article class="content__body">' + tInnerContent + '</article>' + tContentPostDiv;
}

module.exports = replaceContentDivWithArticle;