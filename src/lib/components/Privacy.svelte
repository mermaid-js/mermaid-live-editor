<label for="privacyModal" class="btn btn-ghost flex gap-2">
  <i class="fa-solid fa-shield-halved text-xl"></i> Security
</label>

<input type="checkbox" id="privacyModal" class="modal-toggle" />
<div class="modal" role="dialog">
  <div class="modal-box flex flex-col gap-4 text-base-content">
    <h1 class="text-3xl font-bold">Data security</h1>
    <p>
      <span class="text-xl font-extrabold">
        The content of the diagrams you create never leaves your browser.
      </span>
      It's stored in the URL, and the browser's local storage only.
    </p>
    <p>
      Mermaid live editor is a fully client side application, that will also work as an offline <a
        href="https://web.dev/explore/progressive-web-apps"
        class="link"
        target="_blank">
        PWA.
      </a>
    </p>
    <p>
      The only server we have is a self hosted version of the open source and privacy friendly
      Plausible Analytics. We only collect data related to actions performed, like the type of
      diagram rendered, number of times a feature was used, etc. <br /> All the data we collect is
      anonymized and
      <a href="https://p.mermaid.live/mermaid.live" class="link" target="_blank">
        available publicly.
      </a>
    </p>

    <p>
      Additional services like the external PNG/SVG/Kroki links and "Save to Mermaid Chart" feature
      will share your diagram with the respective 3rd party service.
    </p>

    <label class="btn btn-circle btn-ghost btn-sm absolute right-2 top-2" for="privacyModal">
      X
    </label>
  </div>
</div>
