
#Branchs
Brief explanation of scope for each branch/version

##v1.1-add-url-importing
In this branch, I'm going to build out the ability for the user to export their choices as a url that can be shared or bookmarked

###To dos:
- Set up simple API/endpoint with PHP and possibly some file system files.
- **User view**
   1. On page load, check for provided values in page's query string
   2. Merge these values with the hard-coded default values in the script (or, supplant default values with this - yes that makes sense). So:
      * User lands on page with NO values in query string: load hard-coded default
      * User lands on page WITH values in query string: use those instead
   3. Decide if I should be updating the query string as we go along or just provide an "export URL" button. I kinda already have this in the form of the "copy url" button. Hmm. Can I repurpose this? It will be more involved but better UI to update the page's query string as we go along. Maybe consider this a next-phase item.


#Views:
- **User view:** The default view - user can select query params to build a URL.
- **Edit view:** Add/remove/modify values
- **Review view:** (later) Step between Edit and User - gives user ability to review newly-added or modified data before saving.


#To figure out:
- In edit view, how to handle editing the environment values, ie these are key/value pairs instead of a simple array of values. Also connected - should we give user ability to add additional key/value pair-formatted groups? If so, they could not go in the "Query param" section of the User view. I would need to define a new section, 'settings' perhaps, where each group would be expected to have buttons and would not be a query param.


#Nice to haves:
- **Edit view**
   * "Bulk upload" long lists of values (for example a list of countries) via textbox (or even file!)
   * Drag-drop to reorder groups (or values?)
   * Checkbox to alphabetize values
