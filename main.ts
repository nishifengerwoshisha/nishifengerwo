<plugin>
    <groupId>io.openliberty.tools</groupId>
<artifactId>liberty-maven-plugin</artifactId>
<version>3.12.0</version>
<configuration>
<installDirectory>D:/wlp-space/wlp23</installDirectory>
<serverName>defaultServer</serverName>
<jvmOptions>
<param>-Dfile.encoding=UTF-8</param>
<param>-Dsun.jnu.encoding=UTF-8</param>
    </jvmOptions>
    <!-- 热加载配置 -->
    <hotTests>false</hotTests>
    <skipTests>true</skipTests>
    <stripVersion>false</stripVersion>
    <!-- 关键：启用松散应用 -->
    <looseApplication>true</looseApplication>
    <!-- 启用依赖模块的热编译 -->
    <recompileDependencies>true</recompileDependencies>
    </configuration>
    </plugin>