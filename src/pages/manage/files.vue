<template>
  <q-page padding class="constrain-page-width dao-page dao-files">
    <page-header title="Files" eyebrow="Community workspace" description="A shared library of documents, agreements, and on-chain records." />
    <files-index @loadfile="currentFile = $event" />
    <file-viewer v-if="currentFile" :file="currentFile" class="q-mt-md" />
    <!-- <action-proposer>
      <template v-slot="scope">
          <file-publisher :content="`test`" @propose="scope.propose" @addtobucket="scope.addtobucket" />
      </template>
    </action-proposer> -->
  </q-page>
</template>

<script>
import pageHeader from "components/page-header";
import { defineComponent } from "vue";
import { mapGetters } from "vuex";
// import actionProposer from "components/actions/action-proposer";
// import filePublisher from "components/dacfiles/file-publisher";
import fileViewer from "components/dacfiles/file-viewer";
import filesIndex from "components/dacfiles/files-index";

export default defineComponent({
  name: "files",
  components: {
    pageHeader,
    fileViewer,
    filesIndex,
  },
  computed: {
    ...mapGetters({
      getAccountName: "proton/getAccountName",
      getCoreConfig: "group/getCoreConfig",
    }),
  },
  data() {
    return {
      currentFile: "",
    };
  },
});
</script>
