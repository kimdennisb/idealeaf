# mypost

# Replace res.send() with res.json() methods with necessary arguments for testing purposes
//{
    "DBHost": "mongodb+srv://mypost:mypost@mypost.5vcao.mongodb.net/mypost?retryWrites=true&w=majority"
}

        <% for( var i=0;i < data.length;i++) { %>
          <% const date=data[i].date %>
            <%const year=date.getFullYear() %>
              <%const month=date.getMonth() + 1 %>
                <%const dt=date.getDate() %>
                  <% const monthNames=["January", "February" , "March" , "April" , "May" , "June" , "July" , "August"
                    , "September" , "October" , "November" , "December" ]; %>
                    <tr>
                      <td><input type="checkbox" class="checkbox" id="select-<%=i%>" /></td>
                      <td><label for="select-<%=i%>">
                          <%= data[i].title %>
                        </label></td>
                      <td><label for="select-<%=i%>">
                          <%- dt + " " + monthNames[month] + " " + year %>
                        </label></td>
                    </tr>
                    <% } %>