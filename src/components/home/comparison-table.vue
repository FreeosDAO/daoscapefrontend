<template>
  <div>
    <q-markup-table
      :dark="false"
      separator="horizontal"
      class="comparison-table bg-transparent no-shadow"
    >
      <thead>
        <tr style="height: 80px">
          <th class="text-left"></th>
          <th class="text-center">
            <q-img
              style="
                width: 20vw;
                max-width: 135px;
                min-width: 100px;
              "
              contain
              src="~assets/the_daoscape_logo.svg"
            />
          </th>
          <th class="text-center bg-grey-9">
            <div
              style="width: 20vw; max-width: 100px; min-width: 100px; margin: 0 auto"
              class="text-h5 text-center text-white"
            ><em>Other<br>DAOs</em></div>
          </th>
        </tr>
      </thead>
      <tbody class="bg-white text-weight-bold">
        <tr>
          <td class="text-left bg-grey-9">Pricing</td>
          <td class="text-center">Democratic - no tokens required*</td>
          <td class="text-center">Plutocratic - token weighted voting only</td>
        </tr>
        <tr>
          <td class="text-left bg-grey-9">Modular</td>
          <td class="text-center">
            <q-icon name="check" color="positive" size="24px" />
          </td>
          <td class="text-center">
            <q-icon name="close" color="negative" size="24px" />
          </td>
        </tr>
        <tr>
          <td class="text-left bg-grey-9">100% on chain</td>
          <td class="text-center">
            <q-icon name="check" color="positive" size="24px" />
          </td>
          <td class="text-center">
            <q-icon name="close" color="negative" size="24px" />
          </td>
        </tr>
        <tr>
          <td class="text-left bg-grey-9">Centralized API</td>
          <td class="text-center">
            <q-icon name="close" color="negative" size="24px" />
          </td>
          <td class="text-center">
            <q-icon name="check" color="positive" size="24px" />
          </td>
        </tr>
        <tr>
          <td class="text-left bg-grey-9">Trustless & Permissionless</td>
          <td class="text-center">
            <q-icon name="check" color="positive" size="24px" />
          </td>
          <td class="text-center">
            <q-icon name="close" color="negative" size="24px" />
          </td>
        </tr>
        <tr>
          <td class="text-left bg-grey-9">Censorship Resistance</td>
          <td class="text-center">
            <q-icon name="check" color="positive" size="24px" />
          </td>
          <td class="text-center">
            <q-icon name="close" color="negative" size="24px" />
          </td>
        </tr>
      </tbody>
    </q-markup-table>
    <div class="text-caption text-grey q-my-md">
      *If desired, DAOs may use token-weighted voting, but this is not required, nor the default state for the DAO. 
    </div>
  </div>
</template>

<script>
import { defineComponent } from "vue";

export default defineComponent({
  // name: 'ComponentName',
  data() {
    return {};
  },
});
</script>
<style>
.comparison-table th:first-child {
  background-color: transparent !important;
}

.comparison-table th {
  background-color: #02fbec;
}

.comparison-table td:first-child {
  background-color: #02fbec;
  color: white;
}
.comparison-table thead th:first-child,
.comparison-table tbody td:first-child {
  position: sticky;
  left: 0;
  z-index: 1;
}
</style>
