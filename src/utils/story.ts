import { ReserveUrls } from "src/data/reserve-urls"
import { IDType } from "src/types/id"
import { Story } from "src/types/story"

export const getStoryUrl = (story:Story) => {
    if (story.url) {
        return story.url
    }

    if (story.type === IDType.Post) {
        return `/${story.creator.username}/${story.id}`
    }

    if (story.type === IDType.Series) {
        return `${ReserveUrls.Series}/${story.id}`
    }

    if (story.type === IDType.Book) {
        return `${ReserveUrls.Books}/${story.id}`
    }

    return "/"
}

export const getCommentsUrl = (story:Story) => {
    if (story.type === IDType.Post) {
        return `/${story.creator.username}/${story.id}`
    }

    if (story.type === IDType.Series) {
        return `${ReserveUrls.Series}/${story.id}`
    }

    if (story.type === IDType.Book) {
        return `${ReserveUrls.Books}/${story.id}`
    }

    return "/"
}