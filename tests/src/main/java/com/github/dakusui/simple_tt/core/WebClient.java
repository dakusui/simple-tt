package com.github.dakusui.simple_tt.core;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.concurrent.TimeUnit;

public class WebClient {
  
  
  private static final HttpClient client = HttpClient.newBuilder()
                                                     .connectTimeout(Duration.ofSeconds(5))
                                                     .build();
  
  public static void main(String[] args) throws Exception {
    HttpRequest request = HttpRequest.newBuilder()
                                     .uri(URI.create("http://localhost:3000"))
                                     .timeout(Duration.ofSeconds(10)) // optional full-request timeout
                                     .build();
    
    client.sendAsync(request, HttpResponse.BodyHandlers.ofInputStream())
          .orTimeout(5, TimeUnit.SECONDS)
          .thenAccept(response -> {
            try (BufferedReader reader = new BufferedReader(new InputStreamReader(response.body()))) {
              String line;
              while ((line = reader.readLine()) != null) {
                System.out.println(line); // stream lines like curl
              }
            } catch (Exception e) {
              System.err.println("Error reading body: " + e.getMessage());
            }
          })
          .exceptionally(ex -> {
            System.err.println("Request failed: " + ex);
            return null;
          })
          .join(); // wait for completion
  }
}
