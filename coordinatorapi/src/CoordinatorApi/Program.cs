using CoordinatorApi.ElasticsearchStorage;
using CoordinatorApi.Query;
using CoordinatorApi.Receive;

var builder = WebApplication.CreateBuilder(args);

builder.AddReceive();
builder.AddQuery();
builder.AddElasticsearchStorage();

var app = builder.Build();

app.UseDefaultFiles();
app.UseStaticFiles();

if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Error");
}

app.MapReceive();
app.MapQuery();
app.Map("/", () => Results.Text("Hello!"));

app.Run();
