const SELECTOR_FOLLOW_FORM =
  "body > div.logged-in.env-production.page-responsive.page-profile > div.application-main > main > div > div > div.Layout-sidebar > div > div > div.d-flex.flex-column > div.flex-order-1.flex-md-order-none > div > div > span > form:nth-child(1)";
const SELECTOR_UNFOLLOW_FORM =
  "body > div.logged-in.env-production.page-responsive.page-profile > div.application-main > main > div > div > div.Layout-sidebar > div > div > div.d-flex.flex-column > div.flex-order-1.flex-md-order-none > div > div > span > form:nth-child(2)";
const SELECTOR_UNFOLLOW_BUTTON =
  "body > div.logged-in.env-production.page-responsive.page-profile > div.application-main > main > div > div > div.Layout-sidebar > div > div > div.d-flex.flex-column > div.flex-order-1.flex-md-order-none > div > div > span > form:nth-child(2) > input.btn.btn-block";

export function addProfileButtons() {
    const followForm = document.querySelector(SELECTOR_FOLLOW_FORM);
    const unFollowForm = document.querySelector(SELECTOR_UNFOLLOW_FORM);

    if (followForm) {
        const followButton = followForm?.children[1];
        followForm.style.display = "flex";
        followForm.style.flexDirection = "row";
        unFollowForm.style.display = "flex";
        unFollowForm.style.flexDirection = "row";

        followForm.innerHTML += `\
        <input type="submit" name="commit" value="Message" class="btn btn-block" title="Message user" aria-label="Message user">
        `;
        unFollowForm.innerHTML += `\
        <input type="submit" name="commit" value="Message" class="btn btn-block" title="Message user" aria-label="Message user">
        `;

        const messageButton = followForm?.children[2];
        const messageButtonUnfollow = unFollowForm?.children[2];
        const unFollowButton = document.querySelector(SELECTOR_UNFOLLOW_BUTTON);

        followButton.style.marginRight = "5px";
        unFollowButton.style.marginRight = "5px";
        messageButton.style.marginLeft = "5px";
        messageButtonUnfollow.style.marginLeft = "5px";

        messageButton.addEventListener("click", (event) => {
            event.preventDefault();
        });

        messageButtonUnfollow.addEventListener("click", (event) => {
            event.preventDefault();
        });
    }
}

const SELECTOR_NAV_PR =
  "body > div.logged-in.env-production.page-responsive > div.position-relative.header-wrapper.js-header-wrapper > header > div.AppHeader-globalBar > div.AppHeader-globalBar-end > div.AppHeader-actions.position-relative";

export function addNavButton() {
    const navPR = document.querySelector(SELECTOR_NAV_PR);
    if (navPR) {
        navPR.innerHTML += `
        <a href="/messages" id="icon-button-SPECIAL" aria-labelledby="tooltip-SPECIAL" data-view-component="true" class="Button Button--iconOnly Button--secondary Button--medium AppHeader-button color-fg-muted rgh-seen--20877287924" data-original-href="https://github.com/messages">
        
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="16" height="16" aria-hidden="true" height="16" viewBox="0 0 16 16" version="1.1" width="16" data-view-component="true" class="octicon octicon-issue-opened Button-visual"><path d="M1 2.75C1 1.784 1.784 1 2.75 1h10.5c.966 0 1.75.784 1.75 1.75v7.5A1.75 1.75 0 0 1 13.25 12H9.06l-2.573 2.573A1.458 1.458 0 0 1 4 13.543V12H2.75A1.75 1.75 0 0 1 1 10.25Zm1.75-.25a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h2a.75.75 0 0 1 .75.75v2.19l2.72-2.72a.749.749 0 0 1 .53-.22h4.5a.25.25 0 0 0 .25-.25v-7.5a.25.25 0 0 0-.25-.25Z"></path></svg>
        </a>
    
    <tool-tip id="tooltip-SPECIAL" for="icon-button-SPECIAL" popover="manual" data-direction="s" data-type="label" data-view-component="true" class="position-absolute sr-only" aria-hidden="true" role="tooltip" style="--tool-tip-position-top: 48px; --tool-tip-position-left: 799.3889007568359px;">Your messages</tool-tip>
    `;
    }
}
