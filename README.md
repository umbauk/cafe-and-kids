<p align="center">
<img src="https://raw.githubusercontent.com/umbauk/cafe-and-kids/public/android-chrome-512x512.png" height="20px">
</p>

# Cafe and Kids

### About the Project 🔘

- **Cafe and Kids** is an app to help parents find great playgrounds near great coffee shops. It is a single page, front-end only app using HTML, CSS, JavaScript and React. 
- It uses Google Maps API and the OpenWeather API. 
- The app is live for users at https://cafeandkids.com (hosted on a Google Cloud Kubernetes cluster)

### Installation 🔮

1. Clone the repository.

```bash
git clone https://github.com/umbauk/cafe-and-kids.git
```    

3. Install dependencies.

```bash
npm install
```

4. Set-up local environment variables.
1. Create a file named `.env` in the root directory & add the following contents.
	
```text
  REACT_APP_GOOGLE_API_KEY=<YOUR_GOOGLE_MAPS_API_KEY>
  REACT_APP_OPEN_WEATHER_KEY=<YOUR_OPEN_WEATHER_API_KEY>
```
2. If you don't have Google Maps or Open Weather API keys, you can get them from [here](https://developers.google.com/maps/documentation/javascript/get-api-key) and [here](https://openweathermap.org/appid) respectively. 

6. Run Tests.

```bash
npm test
```

7. Run the development server.

```bash
npm start
```
