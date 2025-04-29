# 검색 입력 시 한글만 입력되는 문제 해결 보고서

## 문제 개요

웹 페이지의 검색 입력 필드(`<input type="text">`)에 사용자가 텍스트를 입력할 때, 영어, 숫자, 특수 문자 등은 입력되지 않고 오직 한글만 입력되는 현상이 발생했습니다.

## 발생 환경

- **웹 브라우저:** 크롬 및 엣지
- **운영체제:** Windows 10, Windows 11
- **문제 발생 페이지:** top-bar.html

## 문제 분석 과정

1.  **코드 검토 (JavaScript):**

    - `topbar.js`: 검색 입력 필드의 이벤트 리스너(`keypress`)에서 `event.preventDefault()`가 호출되고 있었습니다. 이는 키 입력의 기본 동작 (입력 필드에 문자 표시)을 막는 역할을 합니다.
    - `home.js`, `script.js`, `sidebar.js`: 해당 파일들에서는 입력 제한과 관련된 코드를 발견하지 못했습니다.

2.  **코드 검토 (HTML):**

    - `topbar.html`: 검색 입력 필드(`<input type="text" id="search-bar-input" placeholder="검색" />`)에서 특정 입력 제한 속성(`pattern` 등)은 발견되지 않았습니다.

3.  **코드 검토 (CSS):**

    - `topbar.css`: 검색 입력 필드의 스타일을 정의하고 있지만, 입력 자체를 제한하는 CSS 속성은 사용되지 않았습니다.

4.  **외부 요인 검토:**
    - **브라우저 확장 프로그램:** 비활성화 후에도 동일한 문제가 발생했습니다.
    - **운영체제/입력기 설정:** 다른 웹사이트에서는 정상 입력이 가능했습니다.
    - **브라우저 설정:** 기본값으로 초기화해도 문제가 지속되었습니다.
    - **보안 소프트웨어:** 영향 없음 확인.
    - **하드웨어 (키보드):** 다른 키보드에서도 동일한 문제가 발생했습니다.

## 문제 원인 (최종 분석)

`topbar.js` 파일의 `keypress` 이벤트 리스너에서 `event.preventDefault()`가 모든 키 입력에 대해 실행되고 있었습니다. `keypress` 이벤트의 기본적인 동작은 입력 필드에 문자를 표시하는 것이므로, 이로 인해 Enter 키를 제외한 다른 키 입력은 입력 필드에 표시되지 않았습니다.

**한글 입력의 경우, IME(Input Method Editor)가 여러 번의 키 입력을 조합하여 완전한 글자를 브라우저에 전달하는 과정이 `keypress` 이벤트와는 별개로 처리될 수 있습니다. 이 때문에 `event.preventDefault()`가 호출되더라도 IME가 이미 처리한 내용이 화면에 나타나 한글만 입력되는 것처럼 보이는 현상이 발생했던 것으로 추정됩니다.**

## 해결 방법

`topbar.js` 파일의 `keypress` 이벤트 리스너를 다음과 같이 수정하여 Enter 키를 눌렀을 때만 `event.preventDefault()`를 호출하도록 변경했습니다.

```javascript
searchInput.addEventListener("keypress", (event) => {
  if (event.key === "Enter") {
    event.preventDefault(); // Enter 키의 기본 동작 (새로고침 등) 방지
    triggerSearch();
  }
  // Enter 키가 아닌 다른 키 입력은 기본 동작을 허용
});
```
