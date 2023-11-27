export const context = {
    set postId(postId) {
        if (!postId) {
            delete sessionStorage.postId

            return
        }

        sessionStorage.postId = postId
    },
    get postId() {
        return sessionStorage.postId
    },
    set conversationId(conversationId) {
        if (!conversationId) {
            delete sessionStorage.conversationId

            return
        }

        sessionStorage.conversationId = conversationId
    },
    get conversationId() {
        return sessionStorage.conversationId
    },
    set suggestionId(suggestionId) {
        if (!suggestionId) {
            delete sessionStorage.suggestionId

            return
        }

        sessionStorage.suggestionId = suggestionId
    },
    get suggestionId() {
        return sessionStorage.suggestionId
    },
    set hideHeader(hideHeader) {
        if (!hideHeader) {
            delete sessionStorage.hideHeader

            return
        }

        sessionStorage.hideHeader = hideHeader
    },
    get hideHeader() {
        return sessionStorage.hideHeader
    },
    set summary(summary) {
        if (!summary) {
            delete sessionStorage.summary

            return
        }

        sessionStorage.summary = summary
    },
    get summary() {
        return sessionStorage.summary
    },
    set requestedUserId(requestedUserId) {
        if (!requestedUserId) {
            delete sessionStorage.requestedUserId

            return
        }

        sessionStorage.requestedUserId = requestedUserId
    },
    get requestedUserId() {
        return sessionStorage.requestedUserId
    },
}