## `data-*` 속성의 카멜 케이스 변환 (JavaScript `dataset`)

HTML `data-*` 속성에 접근할 때 JavaScript의 `dataset` 객체는 속성 이름을 자동으로 변환합니다.

**규칙:**

- HTML 속성 이름이 소문자와 하이픈(`-`)으로 이루어진 경우 (예: `data-video-id`), `dataset`에서는 하이픈 다음 글자를 대문자로 변환한 카멜 케이스 이름으로 사용합니다 (예: `element.dataset.videoId`).
- HTML 속성 이름에 이미 대문자가 포함된 경우 (예: `data-channelID`), `dataset`에서는 원래 카멜 케이스를 그대로 사용합니다 (예: `element.dataset.channelID`).

**접근 방법:**

1.  **점 표기법 (`.`)**: 변환된 (또는 유지된) 카멜 케이스 이름을 사용하여 접근합니다.

    ```javascript
    const element1 = document.querySelector("[data-video-id]");
    const videoId1 = element1.dataset.videoId; // data-video-id 접근

    const element2 = document.querySelector("[data-channelID]");
    const channelId2 = element2.dataset.channelID; // data-channelID 접근
    ```

2.  **대괄호 표기법 (`[]`)**: **카멜 케이스 문자열**을 사용하여 접근합니다.

    ```javascript
    const element1 = document.querySelector("[data-video-id]");
    const videoId1 = element1.dataset["videoId"]; // data-video-id 접근 (카멜 케이스)

    const element2 = document.querySelector("[data-channelID]");
    const channelId2 = element2.dataset["channelID"]; // data-channelID 접근 (카멜 케이스)
    ```

**주의:**

원래 문법상으로는 대괄호 표기법을 사용하여 원래 HTML 속성 이름(하이픈 포함)을 문자열 형태로 접근하는 것 (`element.dataset["video-id"]`)이 유효해야 합니다. 하지만 현재 테스트 환경에서는 해당 방식으로 접근했을 때 `undefined`를 반환하는 것을 확인했습니다. 이러한 비표준적인 동작은 브라우저 구현 방식의 차이나 JavaScript 엔진의 내부 처리 방식 때문일 것으로 추측됩니다.

**결론적으로,** `data-*` 속성에 접근할 때 `dataset`은 HTML 속성 이름의 형태에 따라 적절하게 변환하거나 유지하며, JavaScript에서는 **카멜 케이스**를 기준으로 점 표기법 또는 대괄호 표기법으로 접근하는 것이 가장 안전하고 일관된 결과를 제공합니다. 따라서 **대괄호 표기법을 사용할 때도 카멜 케이스 문자열을 사용하는 것을 권장합니다.**
